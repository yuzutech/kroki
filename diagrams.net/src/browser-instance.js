const puppeteer = require('puppeteer')
const path = require('path')

const createBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    ignoreDefaultArgs: true,
    args: [
      '--disable-web-security',
      '--allow-file-access-from-files',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  })
  try {
    return browser
  } catch (err) {
    browser.close()
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
