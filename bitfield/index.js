#!/usr/bin/env node
const bitfield = require('bit-field')
// const render = require('bit-field/lib/render')
const json5 = require('json5')
const onml = require('onml')
// const waveSkin = bitfield.waveSkin

const argv = require('yargs')
  .version(false)
  .argv

const encoding = 'utf-8'
let data

async function convert () {
  const source = data.toString(encoding)
  if (source === '') {
    return
  }
  try {
    const json = json5.parse(source)
    const result = bitfield.render(json.reg, json.config)
    const svg = onml.s(result)
    console.log(svg)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

(async () => {
  if (argv.version) {
    const version = require('./package.json').dependencies.bitfield
    console.log(`bitfield ${version}`)
    process.exit(0)
  }
  if (process.stdin.isTTY) {
    // Even though executed by name, the first argument is still "node",
    // the second the script name. The third is the string we want.
    data = Buffer.from(process.argv[2] || '', encoding)
    await convert()
  } else {
    // Accepting piped content. E.g.:
    // echo "pass in this string as input" | ./example-script
    data = ''
    process.stdin.setEncoding(encoding)

    process.stdin.on('readable', function () {
      let chunk = process.stdin.read()
      while (chunk) {
        data += chunk
        chunk = process.stdin.read()
      }
    })

    process.stdin.on('end', async function () {
      // There will be a trailing \n from the user hitting enter. Get rid of it.
      data = data.replace(/\n$/, '')
      await convert()
    })
  }
})()
