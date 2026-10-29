import puppeteer from 'puppeteer'
import { createBrowserInstance } from '@kroki/browser-instance'

import { logger } from './logger.js'

export const { closeOnShutdown, getBrowserWSEndpoint, protocolTimeout, applyNetworkPolicy } =
  createBrowserInstance({
    puppeteer,
    logger,
    envPrefix: 'KROKI_DIAGRAMSNET',
    extraArgs: [
      // In unsafe mode, the worker inlines the images referenced by the
      // diagram with fetch() from a file:// page, which CORS would otherwise
      // reject. It doesn't widen what the page can reach: outbound requests
      // are governed by applyNetworkPolicy (KROKI_DIAGRAMSNET_SAFE_MODE /
      // KROKI_DIAGRAMSNET_ALLOWED_ORIGINS).
      '--disable-web-security'
    ]
  })
