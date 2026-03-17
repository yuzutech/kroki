import puppeteer from 'puppeteer'

import { logger } from './logger.js'

let INSTANCE

const createBrowser = async () => {
  const browser = await puppeteer.launch({
    dumpio: true,
    // reference: https://peter.sh/experiments/chromium-command-line-switches/
    args: [
      // allow to access files from file:// protocol
      '--allow-file-access-from-files',
      // Disables GPU hardware acceleration.
      // If software renderer is not in place, then the GPU process won't launch.
      '--disable-gpu',
      '--disable-translate',
      // Disable the setuid sandbox (Linux only)
      '--disable-setuid-sandbox',
      // disable web security to access local files
      '--disable-web-security',
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
      '--disable-software-rasterizer'
    ]
  })
  const browserProcess = browser.process()
  logger.info(`Chrome instance launched with pid ${browserProcess.pid}`)

  browserProcess.stdout.unpipe()
  browserProcess.stderr.unpipe()
  browserProcess.stdout.on('data', (data) => {
    logger.debug({ stdout: data.toString() }, 'chrome process stdout')
  })
  browserProcess.stderr.on('data', (data) => {
    logger.error({ stderr: data.toString() }, 'chrome process')
  })
  browserProcess.stdout.resume()
  browserProcess.stderr.resume()
  browserProcess.on('disconnect', () => {
    logger.warn('chrome process disconnected')
  })
  browserProcess.on('error', (err) => {
    logger.error({ err }, 'chrome process errored')
  })
  browserProcess.on('exit', (code, signal) => {
    logger.error({ code, signal }, 'chrome process exited')
    browserProcess.kill()
    browser.close()
    INSTANCE = undefined
  })
  browserProcess.on('message', (message) => {
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

export async function getBrowserWSEndpoint () {
  if (INSTANCE === undefined) {
    INSTANCE = await createBrowser()
    logger.info(`Chrome accepting connections on endpoint ${INSTANCE.wsEndpoint()}`)
  }
  return INSTANCE.wsEndpoint()
}
