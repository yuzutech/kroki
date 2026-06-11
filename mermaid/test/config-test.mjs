'use strict'
// must be declared first
import { logger } from '../src/logger.js'

import { describe, it } from 'node:test'
import { deepEqual } from 'node:assert'
import { updateConfig } from '../src/config.js'

describe('#updateConfig', function () {
  it('should update config but ignore sensitive option', function () {
    const config = {
      theme: 'default',
      class: {
        useMaxWidth: false
      },
      er: {
        useMaxWidth: false
      },
      flowchart: {
        useMaxWidth: false
      },
      gantt: {
        useMaxWidth: false
      },
      git: {
        useMaxWidth: false
      },
      journey: {
        useMaxWidth: false
      },
      sequence: {
        useMaxWidth: false
      },
      state: {
        useMaxWidth: false
      }
    }
    let urlSearchParams = new URLSearchParams()
    urlSearchParams.set('er_title-top-margin', '10')
    urlSearchParams.set('SECURITY-level', 'loose')
    updateConfig(config, urlSearchParams)
    deepEqual(config.er.titleTopMargin, 10)
    deepEqual(config.securityLevel, undefined)
  })

  it('should ignore attempts to raise resource caps (maxEdges, maxTextSize)', function () {
    const config = {}
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.set('max-edges', '500000')
    urlSearchParams.set('max-text-size', '5000000')
    updateConfig(config, urlSearchParams)
    deepEqual(config.maxEdges, undefined)
    deepEqual(config.maxTextSize, undefined)
  })
})
