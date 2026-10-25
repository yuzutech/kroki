import { describe, it } from 'node:test'
import { deepEqual, rejects } from 'node:assert'
import { createSemaphore, QueueFullError, Semaphore } from '../index.js'

describe('#semaphore', function () {
  it('should grant permits up to the maximum', async function () {
    const semaphore = new Semaphore(2, { maxQueueSize: 10, queueTimeout: 1000 })
    await semaphore.acquire()
    await semaphore.acquire()
    deepEqual(semaphore.count, 2)
    deepEqual(semaphore.queue.length, 0)
  })

  it('should reject requests when the wait queue is full', async function () {
    const semaphore = new Semaphore(1, { maxQueueSize: 0, queueTimeout: 1000 })
    await semaphore.acquire()
    await rejects(semaphore.acquire(), QueueFullError)
  })

  it('should reject requests that wait too long for a permit', async function () {
    const semaphore = new Semaphore(1, { maxQueueSize: 10, queueTimeout: 50 })
    await semaphore.acquire()
    await rejects(semaphore.acquire(), QueueFullError)
    deepEqual(semaphore.queue.length, 0, 'the timed out request must leave the queue')
  })

  it('should hand the permit over to the next queued request', async function () {
    const semaphore = new Semaphore(1, { maxQueueSize: 10, queueTimeout: 1000 })
    await semaphore.acquire()
    const acquired = semaphore.acquire()
    deepEqual(semaphore.queue.length, 1)
    semaphore.release()
    await acquired
    deepEqual(semaphore.count, 1)
    deepEqual(semaphore.queue.length, 0)
    semaphore.release()
    deepEqual(semaphore.count, 0)
  })

  it('should read its configuration from the service environment variables', function () {
    process.env.KROKI_TEST_MAX_CONCURRENCY = '3'
    process.env.KROKI_TEST_MAX_QUEUE_SIZE = '7'
    process.env.KROKI_TEST_QUEUE_TIMEOUT = '1234'
    try {
      const semaphore = createSemaphore({ envPrefix: 'KROKI_TEST', maxConcurrency: 4 })
      deepEqual(
        [semaphore.max, semaphore.maxQueueSize, semaphore.queueTimeout],
        [3, 7, 1234]
      )
    } finally {
      delete process.env.KROKI_TEST_MAX_CONCURRENCY
      delete process.env.KROKI_TEST_MAX_QUEUE_SIZE
      delete process.env.KROKI_TEST_QUEUE_TIMEOUT
    }
  })

  it('should use the defaults when the environment variables are not set', function () {
    const semaphore = createSemaphore({ envPrefix: 'KROKI_UNSET', maxConcurrency: 4 })
    deepEqual([semaphore.max, semaphore.maxQueueSize, semaphore.queueTimeout], [4, 100, 30000])
  })
})
