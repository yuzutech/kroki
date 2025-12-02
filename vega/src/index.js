#!/usr/bin/env node
import yargs from 'yargs'
import { convert as convertVega } from './convert.js'

const argv = yargs
  .version(false)
  .argv

const encoding = 'utf-8'
let data
let format = 'svg'
let safeMode = 'secure'
let specFormat = 'default'

async function convert () {
  const source = data.toString(encoding)
  if (source === '') {
    return
  }
  try {
    const result = await convertVega(source, {
      specFormat,
      safeMode,
      format
    })
    process.stdout.write(result)
  } catch (err) {
    if (err && err.name) {
      if (err.name === 'UnsafeIncludeError') {
        console.error(err.message)
        process.exit(13) // permission denied
      } else if (err.name === 'IllegalArgumentError') {
        console.error(err.message)
        process.exit(22) // invalid argument
      }
    }
    console.error(err)
    process.exit(1)
  }
}

(async () => {
  if (argv.version) {
    const version = require('../package.json').dependencies.vega
    console.log(`vega ${version}`)
    process.exit(0)
  }
  if (argv.outputFormat) {
    format = argv.outputFormat
  }
  if (argv.safeMode) {
    safeMode = argv.safeMode.toLowerCase()
  }
  if (argv.specFormat) {
    specFormat = argv.specFormat.toLowerCase()
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
