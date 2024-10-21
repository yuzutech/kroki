import puppeteer from 'puppeteer'

const createBrowser = async () => {
  const browser = await puppeteer.launch({
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
  try {
    return browser
  } catch (err) {
    await browser.close()
    throw err
  } finally {
    await browser.disconnect()
  }
}

export async function create () {
  return createBrowser()
}
