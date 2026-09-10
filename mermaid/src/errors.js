import { logger } from './logger.js'

export class TimeoutError extends Error {
  constructor(timeoutDurationMs, action = 'convert') {
    super(`Timeout error: ${action} took more than ${timeoutDurationMs}ms`)
  }
}

export class SyntaxError extends Error {
  constructor(err) {
    super('Syntax error in graph', { cause: err })
    logger.error(this)
    this.name = 'SyntaxError'
    this.message = err.message
  }
}

export class MaxTextSizeError extends Error {
  constructor(actualSize, maxTextSize) {
    super(`Diagram source is too large: ${actualSize} characters (maximum is ${maxTextSize})`)
    this.name = 'MaxTextSizeError'
  }
}
