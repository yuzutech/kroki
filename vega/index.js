#!/usr/bin/env node
const vega = require('vega')
const vegaLite = require('vega-lite')
const argv = require('yargs')
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
    let spec = JSON.parse(source)
    if (specFormat === 'lite') {
      spec = vegaLite.compile(spec).spec
    }
    if (safeMode === 'secure' && spec && spec.data && Array.isArray(spec.data)) {
      const dataWithUrlAttribute = spec.data.filter((item) => item.url)
      if (dataWithUrlAttribute && dataWithUrlAttribute.length > 0) {
        console.error(`Unable to load data from an URL while running in secure mode.
Please include your data set as 'values' or run Kroki in unsafe mode using the KROKI_SAFE_MODE environment variable.`)
        process.exit(13) // permission denied
      }
    }
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
      process.exit(22) // invalid argument
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

(async () => {
  if (argv.version) {
    const version = require('./package.json').dependencies.vega
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
