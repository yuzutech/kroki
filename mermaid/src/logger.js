const pinoDebug = require('pino-debug')
const pino = require('pino')
const logger = pino({
  level: process.env.LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
})
pinoDebug(logger, {
  auto: true, // default
  map: {
    'puppeteer:*': 'debug',
    '*': 'trace' // everything else - trace
  }
})

module.exports.logger = logger
