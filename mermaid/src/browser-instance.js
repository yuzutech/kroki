const puppeteer = require('puppeteer')

const { logger } = require('./logger')

const createBrowser = async () => {
  const browser = await puppeteer.launch({
    dumpio: true,
    args: [
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-initial-navigation',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  })

  const browserProcess = browser.process()
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
    browser.disconnect()
  }
}

module.exports = {
  create: async () => {
    return createBrowser()
  }
}
