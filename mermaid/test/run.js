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

await mocha.loadFilesAsync()

try {
  const runner = mocha.run()
  runner.on('fail', () =>  {
    process.exitCode = 1
  })
  runner.on('end', () => {
    process.exit(process.exitCode)
  })
} catch (e) {
  console.log('Something went wrong', e)
  process.exit(1)
}

