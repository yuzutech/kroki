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
  // Disable the setuid sandbox (Linux only)
  '--disable-setuid-sandbox',
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

/**
 * @param {object} options
 * @param {object} options.puppeteer - the puppeteer module of the service
 * @param {object} options.logger - a pino-compatible logger
 * @param {string} options.envPrefix - e.g. 'KROKI_MERMAID'; used to read `${envPrefix}_PROTOCOL_TIMEOUT`
 * @param {string[]} [options.extraArgs] - service-specific Chrome flags appended to the base set
 * @returns {{getBrowserWSEndpoint: () => Promise<string>, protocolTimeout: number}}
 */
export function createBrowserInstance({ puppeteer, logger, envPrefix, extraArgs = [] }) {
  // Cap how long a single CDP call may hang. Puppeteer's default protocolTimeout
  // is 180s: when Chrome gets wedged (e.g. a runaway render), calls outside the
  // convert race — newPage, goto, screenshot, close — would otherwise stall for
  // 3 minutes each, holding pages open and starving the service.
  const protocolTimeout = Number(process.env[`${envPrefix}_PROTOCOL_TIMEOUT`]) || 30000

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

  return { getBrowserWSEndpoint, protocolTimeout }
}
