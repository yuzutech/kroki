const vega = require('vega')
const vegaLite = require('vega-lite')

class UnsafeIncludeError extends Error {
  constructor (message) {
    super(message)
    this.name = 'UnsafeIncludeError'
  }
}

class IllegalArgumentError extends Error {
  constructor (message) {
    super(message)
    this.name = 'IllegalArgument'
  }
}

/**
 * Suppress non critical messages (i.e., warning, info and debug messages) to prevent writing on stderr or stdout.
 */
const nullLogger = {
  warn: (args) => {},
  info: (args) => {},
  debug: (args) => {}
}

async function convert (source, options) {
  const { safeMode, specFormat, format } = options
  let spec = JSON.parse(source)
  if (specFormat === 'lite') {
    spec = vegaLite.compile(spec, { logger: nullLogger }).spec
  }
  if (safeMode === 'secure' && spec && spec.data && Array.isArray(spec.data)) {
    const dataWithUrlAttribute = spec.data.filter((item) => item.url)
    if (dataWithUrlAttribute && dataWithUrlAttribute.length > 0) {
      throw UnsafeIncludeError(`Unable to load data from an URL while running in secure mode.
Please include your data set as 'values' or run Kroki in unsafe mode using the KROKI_SAFE_MODE environment variable.`)
    }
  }
  const view = new vega.View(vega.parse(spec), { renderer: 'none' })
  if (format === 'svg') {
    return await view.toSVG()
  }
  if (format === 'png') {
    const canvas = await view.toCanvas()
    const stream = canvas.createPNGStream()
    let data
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => { data += chunk })
      stream.on('finish', () => resolve(data))
      stream.on('error', (error) => reject(error))
    })
  }
  if (format === 'pdf') {
    const canvas = await view.toCanvas(undefined, { type: 'pdf', context: { textDrawingMode: 'glyph' } })
    const stream = canvas.createPDFStream()
    let data
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => { data += chunk })
      stream.on('finish', () => resolve(data))
      stream.on('error', (error) => reject(error))
    })
  }
  throw new IllegalArgumentError(`Unknown output format: ${format}. Must be one of: svg, png or pdf.`)
}

module.exports = {
  convert
}
