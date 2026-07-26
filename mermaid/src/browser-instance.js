import puppeteer from 'puppeteer'
import { createBrowserInstance } from '@kroki/browser-instance'

import { logger } from './logger.js'

export const { getBrowserWSEndpoint, protocolTimeout, applyNetworkPolicy } = createBrowserInstance({
  puppeteer,
  logger,
  envPrefix: 'KROKI_MERMAID'
})
