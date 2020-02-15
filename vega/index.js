#!/usr/bin/env node
const vega = require('vega')

const encoding = 'utf-8'
let data
let format = 'svg'

async function convert () {
  const source = data.toString(encoding)
  if (source === '') {
    return
  }
  try {
    const spec = JSON.parse(source)
    const view = new vega.View(vega.parse(spec), { renderer: 'none' })
    if (format === 'svg') {
      const svg = await view.toSVG()
      console.log(svg)
    } else if (format === 'png') {
      const canvas = await view.toCanvas()
      const stream = canvas.createPNGStream()
      stream.on('data', chunk => { process.stdout.write(chunk) })
    } else if (format === 'pdf') {
      const canvas = await view.toCanvas(undefined, { type: 'pdf', context: { textDrawingMode: 'glyph' } })
      const stream = canvas.createPDFStream()
      stream.on('data', chunk => { process.stdout.write(chunk) })
    } else {
      console.error(`Unknown output format: ${format}. Must be one of: svg, png or pdf.`)
    }
  } catch (err) {
    console.error(err)
  }
}

(async () => {
  const [, , ...args] = process.argv
  if (args[0] === '--version') {
    const version = require('./package.json').dependencies.vega
    console.log(`vega ${version}`)
    return
  }
  if (args[0] && args[0].startsWith('-T')) {
    format = args[0].substr(2)
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
