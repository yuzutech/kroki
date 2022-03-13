const puppeteer = require('puppeteer')

const createBrowser = async () => {
  const browser = await puppeteer.launch({
    args: [
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-initial-navigation',
      '--no-sandbox',
      // allow to local files from file://
      '--disable-web-security',
      '--allow-file-access-from-files'
    ]
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

const connect = async (browserInstance) => {
  this.browserWSEndpoint = browserInstance.wsEndpoint()
  return puppeteer.connect({
    browserWSEndpoint: this.browserWSEndpoint,
    ignoreHTTPSErrors: true
  })
}

module.exports = {
  create: async () => {
    return createBrowser()
  },
  connect
}
