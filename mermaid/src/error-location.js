// Mermaid parsers report errors as "Parse error on line N", "Lexical error on line N" or
// "Lexer error on line N, column M" (Langium-based diagrams).
const LOCATION_RX = /\b((?:Parse|Lexical|Lexer) error on line )(\d+)((?:, column (\d+))?)/g

// Before parsing, Mermaid removes comment lines and leading whitespace
// (`cleanupComments` in mermaid/src/diagram-api/comments.ts), so the reported line is relative to the cleaned code.
// Keep this expression in sync with Mermaid.
const COMMENT_LINE_RX = /^\s*%%(?!{)[^\n]+\n?/gm

/**
 * Locate a Mermaid syntax error in the diagram source.
 *
 * @param {string} source - the diagram source
 * @param {string} message - the error message reported by Mermaid
 * @returns {{line: number, column: number|undefined, message: string}|undefined} the location of the error (1-based)
 * and the message where the reported lines are translated into lines of the diagram source,
 * or undefined if the error cannot be located.
 */
export function locateError(source, message) {
  if (typeof source !== 'string' || typeof message !== 'string') {
    return undefined
  }
  const toSourceLine = sourceLineMapper(source)
  if (toSourceLine === undefined) {
    return undefined
  }
  let location
  const translatedMessage = message.replace(
    LOCATION_RX,
    (match, prefix, line, columnSuffix, column) => {
      const sourceLine = toSourceLine(Number.parseInt(line, 10))
      if (sourceLine === undefined) {
        return match
      }
      if (location === undefined) {
        location = {
          line: sourceLine,
          column: column === undefined ? undefined : Number.parseInt(column, 10)
        }
      }
      return `${prefix}${sourceLine}${columnSuffix}`
    }
  )
  if (location === undefined) {
    return undefined
  }
  return { ...location, message: translatedMessage }
}

/**
 * @param {string} source
 * @returns {((line: number) => number|undefined)|undefined} a function that translates a line of the code parsed by Mermaid
 * into a line of the diagram source, or undefined if the translation is not supported.
 */
function sourceLineMapper(source) {
  // \r\n and \r are normalized to \n by Mermaid
  const text = source.replace(/\r\n?/g, '\n')
  // Front matter and directives are removed by Mermaid, they are not supported (yet)
  if (/^\s*---/.test(text) || text.includes('%%{')) {
    return undefined
  }
  // offsets[i] is the offset in the text of the i-th character of the code parsed by Mermaid
  const offsets = []
  let cursor = 0
  for (const match of text.matchAll(COMMENT_LINE_RX)) {
    for (let i = cursor; i < match.index; i++) {
      offsets.push(i)
    }
    cursor = match.index + match[0].length
  }
  for (let i = cursor; i < text.length; i++) {
    offsets.push(i)
  }
  // leading whitespace is removed (trimStart)
  let start = 0
  while (start < offsets.length && /\s/.test(text[offsets[start]])) {
    start++
  }
  const kept = offsets.slice(start)
  // offset in the text of the first character of each line of the code parsed by Mermaid
  const lineStarts = []
  if (kept.length > 0) {
    lineStarts.push(kept[0])
  }
  for (let i = 0; i < kept.length - 1; i++) {
    if (text[kept[i]] === '\n') {
      lineStarts.push(kept[i + 1])
    }
  }
  return line => {
    const lineStart = lineStarts[line - 1]
    if (lineStart === undefined) {
      return undefined
    }
    let sourceLine = 1
    for (let i = 0; i < lineStart; i++) {
      if (text[i] === '\n') {
        sourceLine++
      }
    }
    return sourceLine
  }
}
