'use strict'

// must be declared first
import { logger } from '../src/logger.js'

import { describe, it } from 'node:test'
import { deepEqual, rejects } from 'node:assert'
import { QueueFullError, Worker } from '../src/worker.js'
import Task from '../src/task.js'

function failingConnect() {
  return Promise.reject(new Error('Connection closed.'))
}

describe('#semaphore', function () {
  it('should release the permit when connecting to the browser fails', async function () {
    const worker = new Worker()
    worker._connect = failingConnect
    const max = worker.semaphore.max
    // Fail more times than there are permits: before the fix, the first `max`
    // failures leaked their permit and the next call waited forever.
    for (let i = 0; i < max + 1; i++) {
      await rejects(worker.convert(new Task('graph TD\nA-->B')), /Connection closed/)
    }
    deepEqual(worker.semaphore.count, 0)
    deepEqual(worker.semaphore.queue.length, 0)
  })

  it('should release the permit when opening a page fails', async function () {
    const worker = new Worker()
    let disconnected = false
    worker._connect = async () => ({
      newPage: () => Promise.reject(new Error('Target.createTarget timed out')),
      disconnect: async () => {
        disconnected = true
      }
    })
    await rejects(worker.convert(new Task('graph TD\nA-->B')), /timed out/)
    deepEqual(disconnected, true, 'the browser connection must be closed')
    deepEqual(worker.semaphore.count, 0)
  })

  it('should reject requests when the wait queue is full', async function () {
    const worker = new Worker()
    worker.semaphore.count = worker.semaphore.max
    worker.semaphore.maxQueueSize = 0
    await rejects(worker.convert(new Task('graph TD\nA-->B')), QueueFullError)
  })

  it('should reject requests that wait too long for a permit', async function () {
    const worker = new Worker()
    worker.semaphore.count = worker.semaphore.max
    worker.semaphore.queueTimeout = 50
    await rejects(worker.convert(new Task('graph TD\nA-->B')), QueueFullError)
    deepEqual(worker.semaphore.queue.length, 0, 'the timed out request must leave the queue')
  })

  it('should hand the permit over to the next queued request', async function () {
    const worker = new Worker()
    const { semaphore } = worker
    semaphore.count = semaphore.max
    const acquired = semaphore.acquire()
    deepEqual(semaphore.queue.length, 1)
    semaphore.release()
    await acquired
    deepEqual(semaphore.count, semaphore.max)
    deepEqual(semaphore.queue.length, 0)
  })
})
