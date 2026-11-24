#!/usr/bin/env node
// Condensed BuildKit progress output for the CI logs.
//
// Usage:
//   BUILDKIT_PROGRESS=rawjson docker buildx bake ... 2>&1 | node ci/tasks/buildkit-progress.js
//
// The "plain" progress output prints every internal step (load build definition, transferring context,
// auth, layer downloads/extractions, image loading...) and repeats the step headers whenever the output
// switches between parallel steps, which drowns the interesting part. This script reads the "rawjson"
// progress stream and prints one line per Dockerfile step once it completes (with its duration, CACHED
// or the error), followed by the output of the step. Internal steps are only printed when they fail.
// Steps running for a long time are reported every minute, so the log does not look stuck.
// Lines that are not part of the progress stream (buildx errors, warnings...) are printed as is.

import { createInterface } from 'node:readline'

// Dockerfile steps are named "[<target> <stage> <n>/<total>] <instruction>" (target and stage are optional)
const DOCKERFILE_STEP_RX = /^\[(?:[^\]]+ )?\d+\/\d+\] /
const RUNNING_CHECK_INTERVAL_MS = 5_000

const vertexes = new Map()

function getVertex(digest) {
  let vertex = vertexes.get(digest)
  if (!vertex) {
    vertex = { logs: [], printed: false }
    vertexes.set(digest, vertex)
  }
  return vertex
}

function formatStatus(vertex) {
  if (vertex.error) {
    return vertex.error.endsWith('context canceled') ? 'CANCELED' : `ERROR: ${vertex.error}`
  }
  if (vertex.cached) {
    return 'CACHED'
  }
  if (!vertex.completed) {
    return 'INCOMPLETE'
  }
  const duration = (Date.parse(vertex.completed) - Date.parse(vertex.started)) / 1000
  return Number.isNaN(duration) ? 'DONE' : `DONE ${duration.toFixed(1)}s`
}

function printVertex(vertex) {
  console.log(`${vertex.name} ${formatStatus(vertex)}`)
  const output = vertex.logs.join('').replace(/\n$/, '')
  if (output) {
    for (const line of output.split('\n')) {
      console.log(`  ${line}`)
    }
  }
  vertex.logs = []
  vertex.printed = true
}

function onVertex({ digest, name, started, completed, cached, error }) {
  const vertex = getVertex(digest)
  Object.assign(vertex, { name, started, completed, cached, error })
  if (!completed) {
    return
  }
  // BuildKit can complete the same vertex several times: print it once, unless it eventually fails
  if (error || (!vertex.printed && DOCKERFILE_STEP_RX.test(name))) {
    printVertex(vertex)
  }
}

function onLog({ vertex: digest, data }) {
  const vertex = getVertex(digest)
  const text = Buffer.from(data, 'base64').toString('utf8')
  if (vertex.printed) {
    process.stdout.write(text.replace(/^(?=.)/gm, '  '))
  } else {
    vertex.logs.push(text)
  }
}

function onWarning({ vertex: digest, short }) {
  const name = vertexes.get(digest)?.name ?? ''
  console.log(`WARN: ${Buffer.from(short, 'base64').toString('utf8')} ${name}`.trimEnd())
}

function parseProgress(line) {
  if (!line.startsWith('{')) {
    return undefined
  }
  try {
    return JSON.parse(line)
  } catch {
    return undefined
  }
}

const runningReport = setInterval(() => {
  const now = Date.now()
  for (const vertex of vertexes.values()) {
    if (vertex.started && !vertex.completed && !vertex.printed && DOCKERFILE_STEP_RX.test(vertex.name)) {
      const minutes = Math.floor((now - Date.parse(vertex.started)) / 60_000)
      if (minutes > (vertex.reportedMinutes ?? 0)) {
        vertex.reportedMinutes = minutes
        console.log(`${vertex.name} RUNNING ${minutes}m`)
      }
    }
  }
}, RUNNING_CHECK_INTERVAL_MS)

for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
  const progress = parseProgress(line)
  if (!progress) {
    console.log(line)
    continue
  }
  for (const vertex of progress.vertexes ?? []) onVertex(vertex)
  for (const log of progress.logs ?? []) onLog(log)
  for (const warning of progress.warnings ?? []) onWarning(warning)
}
clearInterval(runningReport)

// steps still running when the stream ends (the build failed elsewhere): print their output for context
for (const vertex of vertexes.values()) {
  if (!vertex.printed && vertex.logs.length > 0) {
    printVertex(vertex)
  }
}
