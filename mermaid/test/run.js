#!/usr/bin/env node
'use strict';

require('../src/logger.js')
const ospath = require('path')

const Mocha = require('mocha')
const mocha = new Mocha({})
mocha.addFile(ospath.join(__dirname, 'convert-test.js'))
mocha.run()
