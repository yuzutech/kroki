// must be declared first
import { logger } from '../src/logger.js'

import { describe, it } from 'node:test'
import { deepEqual, rejects } from 'node:assert'
import Worker, { TimeoutError } from '../src/worker.js'
import Task from '../src/task.js'

const SCENE = JSON.stringify({ type: 'excalidraw', elements: [] })

class FakePage {
  constructor(browser) {
    this._browser = browser
    this.closed = false
    this.listeners = {}
    this.evaluate = async () => ({ svg: '<svg/>', error: null })
  }

  browser() {
    return this._browser
  }

  isClosed() {
    return this.closed
  }

  once(event, listener) {
    this.listeners[event] = listener
  }

  emit(event, arg) {
    this.listeners[event]?.(arg)
  }

  on() {}

  async setRequestInterception(value) {
    this.requestInterception = value
  }

  async setViewport() {}
  async goto() {}
  async addScriptTag() {}

  async close() {
    this.closed = true
  }
}

// Replaces the Chrome connection with a fake browser recording every page it opens.
function stubBrowser(worker) {
  const browser = {
    connected: true,
    pages: [],
    async newPage() {
      const page = new FakePage(browser)
      browser.pages.push(page)
      return page
    }
  }
  worker._getBrowser = async () => browser
  return browser
}

describe('#page pool', () => {
  it('should reuse a page across conversions', async () => {
    const worker = new Worker()
    const browser = stubBrowser(worker)
    deepEqual(await worker.convert(new Task(SCENE)), '<svg/>')
    deepEqual(await worker.convert(new Task(SCENE)), '<svg/>')
    deepEqual(browser.pages.length, 1)
    deepEqual(worker.idlePages.length, 1)
    deepEqual(worker.semaphore.count, 0)
  })

  it('should only reuse a page created for the same safe mode', async () => {
    const worker = new Worker()
    const browser = stubBrowser(worker)
    await worker.convert(new Task(SCENE))
    await worker.convert(new Task(SCENE, 'unsafe'))
    await worker.convert(new Task(SCENE, 'secure'))
    deepEqual(browser.pages.length, 2)
    deepEqual(browser.pages[0].requestInterception, true)
    deepEqual(browser.pages[1].requestInterception, undefined)
    deepEqual(worker.idlePages.length, 2)
  })

  it('should not reuse a page that crashed', async () => {
    const worker = new Worker()
    const browser = stubBrowser(worker)
    await worker.convert(new Task(SCENE))
    const [crashedPage] = browser.pages
    crashedPage.emit('error', new Error('Page crashed!'))
    await worker.convert(new Task(SCENE))
    deepEqual(browser.pages.length, 2)
    deepEqual(worker.idlePages.length, 1)
    deepEqual(worker.idlePages[0].page, browser.pages[1])
  })

  it('should put a page back in the pool when Excalidraw fails to render the scene', async () => {
    const worker = new Worker()
    const browser = stubBrowser(worker)
    await worker.convert(new Task(SCENE))
    browser.pages[0].evaluate = async () => ({
      svg: null,
      error: { name: 'TypeError', message: 'Invalid scene', stack: 'TypeError: Invalid scene' }
    })
    await rejects(worker.convert(new Task('{}')), { name: 'TypeError', message: 'Invalid scene' })
    deepEqual(browser.pages[0].closed, false)
    deepEqual(worker.idlePages.length, 1)
    deepEqual(worker.semaphore.count, 0)
  })

  it('should close a page once it reaches the maximum number of uses', async () => {
    const worker = new Worker()
    worker.pageMaxUses = 2
    const browser = stubBrowser(worker)
    await worker.convert(new Task(SCENE))
    await worker.convert(new Task(SCENE))
    deepEqual(browser.pages[0].closed, true)
    deepEqual(worker.idlePages.length, 0)
    await worker.convert(new Task(SCENE))
    deepEqual(browser.pages.length, 2)
  })

  it('should discard a page whose render timed out', async () => {
    const worker = new Worker()
    worker.convertTimeout = 20
    const browser = stubBrowser(worker)
    await worker.convert(new Task(SCENE))
    browser.pages[0].evaluate = () => new Promise(() => {})
    await rejects(worker.convert(new Task(SCENE)), TimeoutError)
    deepEqual(browser.pages[0].closed, true)
    deepEqual(worker.idlePages.length, 0)
    deepEqual(worker.semaphore.count, 0)
  })

  it('should discard a page whose renderer crashed during the render', async () => {
    const worker = new Worker()
    const browser = stubBrowser(worker)
    await worker.convert(new Task(SCENE))
    browser.pages[0].evaluate = async () => {
      throw new Error('Protocol error (Runtime.callFunctionOn): Target crashed')
    }
    await rejects(worker.convert(new Task(SCENE)), /Target crashed/)
    deepEqual(browser.pages[0].closed, true)
    deepEqual(worker.idlePages.length, 0)
  })

  it('should release the permit when opening a page fails', async () => {
    const worker = new Worker()
    const browser = stubBrowser(worker)
    browser.newPage = () => Promise.reject(new Error('Target.createTarget timed out'))
    for (let i = 0; i < worker.semaphore.max + 1; i++) {
      await rejects(worker.convert(new Task(SCENE)), /timed out/)
    }
    deepEqual(worker.semaphore.count, 0)
  })

  it('should drop idle pages when the browser connection is lost', async () => {
    const worker = new Worker()
    const browser = stubBrowser(worker)
    await worker.convert(new Task(SCENE))
    browser.connected = false
    const newBrowser = stubBrowser(worker)
    await worker.convert(new Task(SCENE))
    deepEqual(newBrowser.pages.length, 1)
    deepEqual(worker.idlePages[0].page, newBrowser.pages[0])
  })
})
