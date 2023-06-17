#!/usr/bin/env node
'use strict';

// must be declared first
import '../src/logger.js'
import ospath from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import Mocha from 'mocha'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const mocha = new Mocha({})
mocha.addFile(ospath.join(__dirname, 'convert-test.mjs'))
mocha.addFile(ospath.join(__dirname, 'config-test.mjs'))

mocha.loadFilesAsync()
  .then(() => mocha.run(failures => process.exitCode = failures ? 1 : 0))
  .catch(() => process.exitCode = 1);
