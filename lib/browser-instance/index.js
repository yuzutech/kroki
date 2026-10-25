// Shared Chrome instance manager for the Kroki companion services
// (mermaid, diagrams.net, bpmn, excalidraw).
//
// This package is consumed as a `file:` dependency, which npm installs as a
// symlink: Node resolves imports from the package's *real* location, outside
// the service directory, so nothing from the service node_modules would be
// visible here. It therefore has zero dependencies — the service injects its
// own puppeteer module and logger.

// reference: https://peter.sh/experiments/chromium-command-line-switches/
const BASE_ARGS = [
  // import modules and access files from file://
  '--allow-file-access-from-files',
  // Disables GPU hardware acceleration.
  // If software renderer is not in place, then the GPU process won't launch.
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--disable-translate',
  // Docker's default /dev/shm is 64MB, far below what Chromium wants for shared
  // memory. Without this flag, Chromium crashes (often SIGABRT/SIGSEGV) once it
  // exhausts /dev/shm instead of falling back to /tmp.
  '--disable-dev-shm-usage',
  // Disable the setuid sandbox (Linux only)
  '--disable-setuid-sandbox',
  // Puppeteer's own default args (see ChromeLauncher.defaultArgs) already cover
  // most background chatter (--disable-background-networking, --disable-sync,
  // safe browsing, etc.), but several independent Chromium subsystems still
  // phone home to Google on browser launch regardless: GCM device checkin
  // (android.clients.google.com), network-time/CUP sync (clients2.google.com,
  // www.google.com), account status (accounts.google.com), and the component
  // updater (update.googleapis.com) — confirmed by packet capture even with
  // --disable-component-update/--disable-domain-reliability/--no-pings set.
  // Disabling each subsystem individually is whack-a-mole across Chromium
  // versions, so instead block DNS resolution for the exact hosts confirmed
  // by packet capture. Listed individually rather than as a *.google.com /
  // *.googleapis.com wildcard so this doesn't also swallow legitimate
  // diagram-triggered subresources under the same domains (e.g.
  // fonts.googleapis.com) — those are already gated by applyNetworkPolicy
  // below (KROKI_*_SAFE_MODE / *_ALLOWED_ORIGINS), which is the right layer
  // to opt into them. Extend this list if packet capture turns up another
  // Google host doing this.
  '--disable-component-update',
  '--disable-domain-reliability',
  '--no-pings',
  '--host-resolver-rules=' +
    [
      'update.googleapis.com',
      'clients2.google.com',
      'android.clients.google.com',
      'accounts.google.com',
      'www.google.com'
    ]
      .map(host => `MAP ${host} 127.0.0.1`)
      .join(','),
  // Run in headless mode, i.e., without a UI or display server dependencies
  '--headless',
  // Prevents creating scrollbars for web content. Useful for taking consistent screenshots.
  '--hide-scrollbars',
  // Mutes audio sent to the audio device, so it is not audible during automated testing.
  '--mute-audio',
  // Stops new Shell objects from navigating to a default url. ↪
  '--no-initial-navigation',
  // Disables the sandbox for all process types that are normally sandboxed.
  // Meant to be used as a browser-level switch for testing purposes only.
  '--no-sandbox'
]

export class QueueFullError extends Error {
  constructor(message) {
    super(message)
    this.name = 'QueueFullError'
  }
}

// Caps how many pages (and therefore Chromium renderer processes) may be open
// at once. A single shared Chrome instance has no built-in limit on concurrent
// pages: a burst of requests can spin up enough renderer processes to exceed
// the container's memory/pids limits and crash the browser (renderer OOM,
// "Target crashed", or posix_spawn: Resource temporarily unavailable).
// Requests beyond the cap wait their turn instead.
//
// The wait queue is bounded too, both in size and in time: when Chrome is
// wedged, permits are not returned for a while and every queued request keeps
// its request/response objects and diagram source alive. An unbounded queue
// then grows until the Node.js heap runs out of memory. Rejected requests get
// a 503 so the caller can retry later.
export class Semaphore {
  constructor(max, { maxQueueSize, queueTimeout }) {
    this.max = max
    this.maxQueueSize = maxQueueSize
    this.queueTimeout = queueTimeout
    this.count = 0
    this.queue = []
  }

  async acquire() {
    if (this.count < this.max) {
      this.count++
      return
    }
    if (this.queue.length >= this.maxQueueSize) {
      throw new QueueFullError(
        `Too many pending conversions: ${this.queue.length} requests are already waiting (maximum is ${this.maxQueueSize})`
      )
    }
    return new Promise((resolve, reject) => {
      const waiter = {
        resolve: () => {
          clearTimeout(waiter.timer)
          resolve()
        },
        timer: setTimeout(() => {
          this.queue.splice(this.queue.indexOf(waiter), 1)
          reject(
            new QueueFullError(
              `Timed out after ${this.queueTimeout}ms waiting for a conversion slot`
            )
          )
        }, this.queueTimeout)
      }
      this.queue.push(waiter)
    })
  }

  release() {
    const next = this.queue.shift()
    if (next) {
      next.resolve()
    } else {
      this.count--
    }
  }
}

/**
 * Creates the conversion Semaphore of a companion service, configured from
 * `${envPrefix}_MAX_CONCURRENCY`, `${envPrefix}_MAX_QUEUE_SIZE` and
 * `${envPrefix}_QUEUE_TIMEOUT`.
 *
 * @param {object} options
 * @param {string} options.envPrefix - e.g. 'KROKI_MERMAID'
 * @param {number} [options.maxConcurrency] - default number of concurrent conversions
 * @returns {Semaphore}
 */
export function createSemaphore({ envPrefix, maxConcurrency = 6 }) {
  return new Semaphore(readIntegerEnv(`${envPrefix}_MAX_CONCURRENCY`, maxConcurrency, 1), {
    // 0 is valid: reject immediately (503) whenever every slot is busy.
    maxQueueSize: readIntegerEnv(`${envPrefix}_MAX_QUEUE_SIZE`, 100, 0),
    // Matches the Kroki server's default delegate timeout (KROKI_DELEGATE_TIMEOUT_MS):
    // past that point, nobody is waiting for the response anymore.
    queueTimeout: readIntegerEnv(`${envPrefix}_QUEUE_TIMEOUT`, 30000, 1)
  })
}

// Reads an integer environment variable, falling back to the default when it
// is unset or not an integer >= min (unlike `Number(value) || default`, which
// also discards a legitimate 0).
function readIntegerEnv(name, defaultValue, min) {
  const value = process.env[name]
  if (value === undefined || value.trim() === '') {
    return defaultValue
  }
  const number = Number(value)
  return Number.isInteger(number) && number >= min ? number : defaultValue
}

const SHUTDOWN_TIMEOUT_MS = 8000

// Chrome logs these at ERROR/WARNING level although they are harmless in a
// headless container, so they are logged at debug level only:
// - there is no D-Bus system/session bus (power, accessibility and
//   notification services);
// - the GPU-less compositor occasionally asks for a shared image that was
//   already released;
// - IPC messages to a page that is being closed are rejected;
// - when a Chrome process crashes, crashpad emits dozens of lines about the
//   container sandbox (sched_getscheduler, /sys cpufreq) while collecting the
//   dump: the crash itself is still reported (GPU process exited, 'exit'
//   handler below).
// Chrome stderr is diagnostic chatter rather than a failure signal, so
// everything else is logged as warn.
const CHROME_STDERR_NOISE = [
  /ERROR:dbus\//,
  /SharedImageManager::ProduceMemory/,
  /Message \d+ rejected by interface/,
  /:third_party\/crashpad\//
]

function parseOriginList(value) {
  if (!value) {
    return []
  }
  return value
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
}

/**
 * @param {object} options
 * @param {object} options.puppeteer - the puppeteer module of the service
 * @param {object} options.logger - a pino-compatible logger
 * @param {string} options.envPrefix - e.g. 'KROKI_MERMAID'; used to read `${envPrefix}_PROTOCOL_TIMEOUT`
 *   and `${envPrefix}_ALLOWED_ORIGINS` (falls back to `KROKI_ALLOWED_ORIGINS`)
 * @param {string[]} [options.extraArgs] - service-specific Chrome flags appended to the base set
 * @returns {{getBrowserWSEndpoint: () => Promise<string>, protocolTimeout: number, applyNetworkPolicy: (page: import('puppeteer').Page, opts: {pageUrl: string, safeMode?: string}) => Promise<void>, closeOnShutdown: (server: import('node:http').Server) => void}}
 */
export function createBrowserInstance({ puppeteer, logger, envPrefix, extraArgs = [] }) {
  // Cap how long a single CDP call may hang. Puppeteer's default protocolTimeout
  // is 180s: when Chrome gets wedged (e.g. a runaway render), calls outside the
  // convert race — newPage, goto, screenshot, close — would otherwise stall for
  // 3 minutes each, holding pages open and starving the service.
  const protocolTimeout = Number(process.env[`${envPrefix}_PROTOCOL_TIMEOUT`]) || 30000

  // Origins a deployment explicitly trusts for subresource loading (e.g. an
  // internal image bank) even under a restrictive safe mode. Empty by default:
  // see applyNetworkPolicy below.
  const allowedOrigins = parseOriginList(
    process.env[`${envPrefix}_ALLOWED_ORIGINS`] ?? process.env.KROKI_ALLOWED_ORIGINS
  )

  // Memoize the in-flight launch *promise* (not the resolved browser) so that
  // concurrent callers share a single Chrome instance. Storing the resolved
  // value instead left a window — between the first call entering the launch and
  // it completing — where every concurrent request launched its own browser, and
  // only the last one was ever tracked. The rest leaked (orphaned processes +
  // RSS) and the leak re-opened every time the instance was reset on crash.
  let instancePromise

  // Puppeteer's own SIGTERM/SIGHUP handlers only close Chrome and leave the
  // Node process running: `docker stop` then waited for its grace period
  // before resorting to SIGKILL, and the next request relaunched Chrome in the
  // meantime. Exit instead: Puppeteer's 'exit' hook kills the Chrome process
  // group synchronously on the way out.
  //
  // When the service registered its HTTP server (closeOnShutdown), stop
  // accepting connections first and exit once in-flight conversions are done,
  // or after SHUTDOWN_TIMEOUT_MS (below Docker's default 10s grace period):
  // requests still queued or running at that point are dropped. The listener
  // is registered with `once`, so a second signal terminates immediately.
  let server
  for (const signal of ['SIGTERM', 'SIGINT', 'SIGHUP']) {
    process.once(signal, () => {
      logger.info(`Received ${signal}, shutting down`)
      if (server === undefined) {
        process.exit(0)
      }
      setTimeout(() => {
        logger.warn('In-flight requests did not complete in time, exiting anyway')
        process.exit(0)
      }, SHUTDOWN_TIMEOUT_MS).unref()
      server.close(() => process.exit(0))
    })
  }

  function closeOnShutdown(httpServer) {
    server = httpServer
  }

  const createBrowser = async () => {
    // No dumpio: Puppeteer always pipes and drains the browser stdio itself
    // (keeping the recent lines for its launch error message). dumpio would
    // additionally pipe it raw to our stderr, bypassing the logger until the
    // listeners below are attached.
    const browser = await puppeteer.launch({
      protocolTimeout,
      handleSIGTERM: false,
      handleSIGINT: false,
      handleSIGHUP: false,
      args: [...BASE_ARGS, ...extraArgs]
    })
    const browserProcess = browser.process()
    logger.info(`Chrome instance launched with pid ${browserProcess.pid}`)

    browserProcess.stdout.on('data', data => {
      logger.debug({ stdout: data.toString() }, 'chrome process stdout')
    })
    browserProcess.stderr.on('data', data => {
      for (const line of data.toString().split('\n')) {
        if (line.trim() === '') {
          continue
        }
        if (CHROME_STDERR_NOISE.some(pattern => pattern.test(line))) {
          logger.debug({ stderr: line }, 'chrome process')
        } else {
          logger.warn({ stderr: line }, 'chrome process')
        }
      }
    })
    browserProcess.on('disconnect', () => {
      logger.warn('chrome process disconnected')
    })
    browserProcess.on('error', err => {
      logger.error({ err }, 'chrome process errored')
    })
    browserProcess.on('exit', (code, signal) => {
      logger.error({ code, signal }, 'chrome process exited')
      browserProcess.kill()
      browser.close()
      instancePromise = undefined
    })
    browserProcess.on('message', message => {
      logger.warn({ message }, 'chrome process message')
    })
    // The launcher client disconnects once the browser is up: workers connect
    // (and disconnect) per request over the WebSocket endpoint.
    await browser.disconnect()
    return browser
  }

  async function getBrowserWSEndpoint() {
    if (instancePromise === undefined) {
      instancePromise = createBrowser()
      instancePromise.then(
        browser => logger.info(`Chrome accepting connections on endpoint ${browser.wsEndpoint()}`),
        // If the launch fails, drop the memoized rejected promise so the next
        // request retries instead of being wedged on it forever.
        () => {
          instancePromise = undefined
        }
      )
    }
    const browser = await instancePromise
    return browser.wsEndpoint()
  }

  // Diagram sources can embed attacker-controlled resource URLs (e.g. a Mermaid
  // flowchart image-shape node): rendering them in Chromium would otherwise let
  // the diagram trigger arbitrary outbound HTTP(S) requests from this container
  // (SSRF), regardless of the documented SECURE mode, since neither the page's
  // navigation nor the render call itself is restricted to local assets.
  //
  // safeMode !== 'unsafe' locks the page down to same-origin/local resources
  // plus any operator-configured allowlist, *before* the first navigation, so
  // it also covers requests fired during rendering (not just the final
  // screenshot step).
  async function applyNetworkPolicy(page, { pageUrl, safeMode }) {
    if (safeMode === 'unsafe') {
      return
    }
    let pageOrigin = null
    try {
      const parsed = new URL(pageUrl)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        pageOrigin = parsed.origin
      }
    } catch {
      // pageUrl isn't an absolute URL; only file:/data: will be allowed below
    }
    await page.setRequestInterception(true)
    page.on('request', request => {
      let url
      try {
        url = new URL(request.url())
      } catch {
        request.abort('blockedbyclient')
        return
      }
      const allowed =
        url.protocol === 'file:' ||
        url.protocol === 'data:' ||
        (pageOrigin !== null && url.origin === pageOrigin) ||
        allowedOrigins.includes(url.origin)
      if (allowed) {
        request.continue()
      } else {
        logger.warn(
          { url: request.url() },
          'Blocked a network request while rendering a diagram (safe mode)'
        )
        request.abort('blockedbyclient')
      }
    })
  }

  return { getBrowserWSEndpoint, protocolTimeout, applyNetworkPolicy, closeOnShutdown }
}
