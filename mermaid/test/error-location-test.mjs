import { describe, it } from 'node:test'
import { deepEqual } from 'node:assert'
import { locateError } from '../src/error-location.js'

describe('locateError', () => {
  it('should locate an error when the source is parsed as is', () => {
    const message = "Parse error on line 3:\n...h TD  A-->B  A--> --> C\n---------------------^\nExpecting 'AMP', got 'LINK'"
    deepEqual(locateError('graph TD\n  A-->B\n  A--> --> C', message), { line: 3, column: undefined, message })
  })

  it('should locate an error with a column', () => {
    const message = 'Parsing failed:  Parse error on line 3, column 3: Expecting token of type \'EOF\' but found `foo`.'
    deepEqual(locateError('gitGraph\n  commit\n  foo bar', message), { line: 3, column: 3, message })
  })

  it('should translate the line when comment lines are removed', () => {
    const source = '%% title\ngraph TD\n  %% comment\n  A-->B\n  A--> --> C'
    deepEqual(locateError(source, 'Parse error on line 3:\n...'), { line: 5, column: undefined, message: 'Parse error on line 5:\n...' })
  })

  it('should translate the line when leading blank lines and comments are removed', () => {
    const source = '\n  \n%% c\n\n\ngraph TD\n  A-->B\n  A--> --> C'
    deepEqual(locateError(source, 'Parse error on line 3:\n...'), { line: 8, column: undefined, message: 'Parse error on line 8:\n...' })
  })

  it('should translate every line of the message', () => {
    const source = '%% c\npie\n  "a": 1\n  b 2'
    const message = 'Parsing failed: Lexer error on line 3, column 3: unexpected character. Parse error on line 3, column 5: Expecting token.'
    deepEqual(locateError(source, message), {
      line: 4,
      column: 3,
      message: 'Parsing failed: Lexer error on line 4, column 3: unexpected character. Parse error on line 4, column 5: Expecting token.'
    })
  })

  it('should support CRLF line endings', () => {
    deepEqual(locateError('%% c\r\ngraph TD\r\n  A--> --> C', 'Parse error on line 2:'), { line: 3, column: undefined, message: 'Parse error on line 3:' })
  })

  it('should not locate an error when the source has a front matter', () => {
    deepEqual(locateError('---\ntitle: x\n---\ngraph TD\n  A--> --> C', 'Parse error on line 2:'), undefined)
  })

  it('should not locate an error when the source has a directive', () => {
    deepEqual(locateError('%%{init: {"theme":"dark"}}%%\ngraph TD\n  A--> --> C', 'Parse error on line 2:'), undefined)
  })

  it('should not locate an error when the line is out of range', () => {
    deepEqual(locateError('graph TD\n  A["unterminated', 'Parse error on line 4:'), undefined)
  })

  it('should not locate an error without a line', () => {
    deepEqual(locateError('foo\nbar', 'No diagram type detected matching given configuration for text: foo\nbar'), undefined)
  })
})
