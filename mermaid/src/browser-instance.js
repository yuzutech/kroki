import puppeteer from 'puppeteer'

import { logger } from './logger.js'

// Memoize the in-flight launch *promise* (not the resolved browser) so that
// concurrent callers share a single Chrome instance. Storing the resolved
// value instead left a window — between the first call entering the launch and
// it completing — where every concurrent request launched its own browser, and
// only the last one was ever tracked. The rest leaked (orphaned processes +
// RSS) and the leak re-opened every time the instance was reset on crash.
let INSTANCE_PROMISE

// Cap how long a single CDP call may hang. Puppeteer's default protocolTimeout
// is 180s: when Chrome gets wedged (e.g. a runaway render), calls outside the
// convert race — newPage, goto, screenshot, close — would otherwise stall for
// 3 minutes each, holding pages open and starving the service.
const PROTOCOL_TIMEOUT = Number(process.env.KROKI_MERMAID_PROTOCOL_TIMEOUT) || 30000

const createBrowser = async () => {
  const browser = await puppeteer.launch({
    dumpio: true,
    protocolTimeout: PROTOCOL_TIMEOUT,
    // reference: https://peter.sh/experiments/chromium-command-line-switches/
    args: [
      // Disables GPU hardware acceleration.
      // If software renderer is not in place, then the GPU process won't launch.
      '--disable-gpu',
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
      '--no-sandbox',
      // import modules from file://
      '--allow-file-access-from-files',
      '--disable-software-rasterizer'
    ]
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
    INSTANCE_PROMISE = undefined
  })
  browserProcess.on('message', message => {
    logger.warn({ message }, 'chrome process message')
  })
  try {
    return browser
  } catch (err) {
    await browser.close()
    throw err
  } finally {
    await browser.disconnect()
  }
}

export async function getBrowserWSEndpoint() {
  if (INSTANCE_PROMISE === undefined) {
    INSTANCE_PROMISE = createBrowser()
    INSTANCE_PROMISE.then(
      browser => logger.info(`Chrome accepting connections on endpoint ${browser.wsEndpoint()}`),
      // If the launch fails, drop the memoized rejected promise so the next
      // request retries instead of being wedged on it forever.
      () => {
        INSTANCE_PROMISE = undefined
      }
    )
  }
  const browser = await INSTANCE_PROMISE
  return browser.wsEndpoint()
}
