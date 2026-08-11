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
 * @returns {{getBrowserWSEndpoint: () => Promise<string>, protocolTimeout: number, applyNetworkPolicy: (page: import('puppeteer').Page, opts: {pageUrl: string, safeMode?: string}) => Promise<void>}}
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

  const createBrowser = async () => {
    const browser = await puppeteer.launch({
      dumpio: true,
      protocolTimeout,
      args: [...BASE_ARGS, ...extraArgs]
    })
    const browserProcess = browser.process()
    logger.info(`Chrome instance launched with pid ${browserProcess.pid}`)

    browserProcess.stdout.unpipe()
    browserProcess.stderr.unpipe()
    browserProcess.stdout.on('data', data => {
      logger.debug({ stdout: data.toString() }, 'chrome process stdout')
    })
    browserProcess.stderr.on('data', data => {
      logger.error({ stderr: data.toString() }, 'chrome process')
    })
    browserProcess.stdout.resume()
    browserProcess.stderr.resume()
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
        logger.warn({ url: request.url() }, 'Blocked a network request while rendering a diagram (safe mode)')
        request.abort('blockedbyclient')
      }
    })
  }

  return { getBrowserWSEndpoint, protocolTimeout, applyNetworkPolicy }
}
