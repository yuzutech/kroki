#!/usr/bin/env node
const { convert: convertWaveDrom } = require('./convert.js')

const argv = require('yargs')
  .version(false)
  .argv

const encoding = 'utf-8'
let data

function convert () {
  const source = data.toString(encoding)
  try {
    const result = convertWaveDrom(source)
    console.log(result)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

if (argv.version) {
  const version = require('./package.json').dependencies.wavedrom
  console.log(`wavedrom ${version}`)
  process.exit(0)
}
if (process.stdin.isTTY) {
  // Even though executed by name, the first argument is still "node",
  // the second the script name. The third is the string we want.
  data = Buffer.from(process.argv[2] || '', encoding)
  convert()
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

  process.stdin.on('end', function () {
    // There will be a trailing \n from the user hitting enter. Get rid of it.
    data = data.replace(/\n$/, '')
    convert()
  })
}
