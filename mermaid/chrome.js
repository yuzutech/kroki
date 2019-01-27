const puppeteer = require('puppeteer')
let browserWSEndpoint

const createBrowser = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  try {
    return browser.wsEndpoint()
  } catch (err) {
    console.log(err)
    throw err
  } finally {
    browser.disconnect()
  }
}

module.exports = {
  init: async () => {
    browserWSEndpoint = await createBrowser()
    return browserWSEndpoint
  },
  browserWSEndpoint: () => browserWSEndpoint
}
