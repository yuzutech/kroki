import puppeteer from 'puppeteer'
import { createBrowserInstance } from '@kroki/browser-instance'

import { logger } from './logger.js'

export const { getBrowserWSEndpoint, protocolTimeout } = createBrowserInstance({
  puppeteer,
  logger,
  envPrefix: 'KROKI_BPMN',
  extraArgs: [
    // allow local file access for diagram rendering
    '--allow-file-access-from-files'
  ]
})
