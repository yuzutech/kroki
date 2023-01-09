/* global describe, it, mocha */
'use strict'

const { updateConfig } = require('../src/config')
const chai = require('chai')
const expect = chai.expect

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
    expect(config.er.titleTopMargin).to.equal(10)
    expect(config.securityLevel).to.equal(undefined)
  })
})
