const pinoDebug = require('pino-debug')
const logger = require('pino')({ level: process.env.LEVEL || 'info' })
pinoDebug(logger, {
  auto: true, // default
  map: {
    'puppeteer:*': 'debug',
    '*': 'trace' // everything else - trace
  }
})

module.exports.logger = logger
