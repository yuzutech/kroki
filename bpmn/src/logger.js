import pinoDebug from 'pino-debug'
import pino from 'pino'

export const logger = pino({
  level: process.env.LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }
    }
  }
})
pinoDebug(logger, {
  auto: true, // default
  map: {
    'puppeteer:*': 'debug',
    '*': 'trace' // everything else - trace
  }
})
