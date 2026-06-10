#!/usr/bin/env node
const { run } = require('@softwaretechnik/dbml-renderer')

const encoding = 'utf-8'
let data

async function convert() {
  const source = data.toString(encoding)
  if (source === '') {
    return
  }
  try {
    const svg = run(source, 'svg')
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
