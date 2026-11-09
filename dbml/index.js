#!/usr/bin/env node
const { run } = require('@softwaretechnik/dbml-renderer')

const encoding = 'utf-8'
let data

// Absolute http(s)/mailto URLs, or relative references (no scheme): the part before the first
// "/", "?" or "#" must not contain ":" (a scheme) or "&" (an XML entity that could hide one).
const SAFE_URL = /^(?:(?:https?|mailto):|[^:&/?#]*(?:[/?#]|$))/i

// The renderer copies the table "url" setting (and anything injected in the HTML-like label,
// e.g. through "headercolor") into Graphviz HREF attributes without validation.
// Remove the links whose scheme is not allowed (javascript:, data:...) to prevent XSS.
function removeUnsafeLinks(svg) {
  return svg.replace(/\s(?:xlink:)?href="([^"]*)"/g, (attribute, url) =>
    SAFE_URL.test(url) ? attribute : ''
  )
}

async function convert() {
  const source = data.toString(encoding)
  if (source === '') {
    return
  }
  try {
    const svg = removeUnsafeLinks(run(source, 'svg'))
    console.log(svg)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

const [, , ...args] = process.argv
if (args[0] === '--version') {
  const version = require('./package.json').dependencies['@softwaretechnik/dbml-renderer']
  console.log(`dbml ${version}`)
  process.exit(0)
}

;(async () => {
  data = ''
  process.stdin.setEncoding(encoding)

  process.stdin.on('readable', () => {
    let chunk = process.stdin.read()
    while (chunk) {
      data += chunk
      chunk = process.stdin.read()
    }
  })

  process.stdin.on('end', async () => {
    // There will be a trailing \n from the user hitting enter. Get rid of it.
    data = data.replace(/\n$/, '')
    await convert()
  })
})()
