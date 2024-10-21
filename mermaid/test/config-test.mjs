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
})
