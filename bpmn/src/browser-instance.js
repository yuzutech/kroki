const puppeteer = require('puppeteer')

const createBrowser = async () => {
  const browser = await puppeteer.launch({
    args: [
      '--no-zygote',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-initial-navigation',
      '--single-process',
      '--no-sandbox',
      '--disable-setuid-sandbox'
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

module.exports = {
  create: async () => {
    return createBrowser()
  }
}
