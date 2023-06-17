import apm from 'elastic-apm-node'
import process from 'node:process'
import { logger } from './logger.js'

const serviceName = process.env.KROKI_ELASTIC_APM_SERVICE_NAME || 'kroki-mermaid'
const secretToken = process.env.KROKI_ELASTIC_APM_SECRET_TOKEN
const serverUrl = process.env.KROKI_ELASTIC_APM_SECRET_URL
const environment = process.env.KROKI_ELASTIC_APM_ENVIRONMENT || 'prod'

if (secretToken && serverUrl) {
  try {
    apm.start({
      serviceName,
      secretToken,
      serverUrl,
      environment
    })
  } catch (err) {
    logger.error({ err }, 'Unable to start Elastic APM')
  }
}

/**
 * @param {string} name
 * @param {string} type
 * @param {apm.Labels} [labels]
 * @param {SpanOptions} [opts]
 * @returns {Span|undefined}
 */
export function startSpan (name, type, labels, opts) {
  if (apm.isStarted()) {
    const span = apm.startSpan(name, opts)
    if (labels) {
      span.addLabels(labels)
    }
    return span
  }
}

/**
 * @param {Span|undefined} span
 */
export function successfulSpan (span) {
  if (span) {
    span.setOutcome('success')
    span.end()
  }
}

/**
 * @param span
 * @param {Error} err
 */
export function failureSpan (span, err) {
  if (span) {
    apm.logger.error({ err })
    span.setOutcome('failure')
    span.end()
  }
}
