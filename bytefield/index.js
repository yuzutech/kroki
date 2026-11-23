#!/usr/bin/env node

// bytefield-svg evaluates its (attacker-controlled) input with sci, a Clojure interpreter running
// in this Node realm. The sci sandbox exposes `aget`/`aset`, which read and write arbitrary
// properties on any reachable JavaScript object and bypass sci's method-authorization check. On
// their own they cannot reach the host globals (`process`, `require`, ...): the objects a diagram
// can reach (`String`, `Object`, `Error`, ...) do not reference them. A diagram bridges to the
// host realm either through code generation (`new Function`/`eval`) or through V8 stack frames:
// it rebinds the native `CallSite.getThis` as a property getter (so it runs with `this` bound to a
// CallSite, sidestepping sci's check), walks `Error.prepareStackTrace` -> `CallSite[]` -> a frame
// receiver that is the global object, and from there reaches `process` and `child_process`
// (remote code execution). The `--disallow-code-generation-from-strings` flag set in NODE_OPTIONS
// by the server closes the first bridge; locking `Error.prepareStackTrace` here closes the second.
//
// With `prepareStackTrace` frozen to `undefined`, `Error.prototype.stack` is always a plain string,
// so diagram code can no longer obtain `CallSite` objects, and therefore cannot climb to a frame
// receiver, `process`, or the network (which would otherwise allow exfiltrating `process.env`). The
// property is made non-writable and non-configurable so the sandboxed code cannot restore it with
// `aset` or `Object.defineProperty`. bytefield-svg does not rely on a custom `prepareStackTrace`;
// its own errors keep producing the default string stack trace.
Object.defineProperty(Error, 'prepareStackTrace', {
  value: undefined,
  writable: false,
  enumerable: false,
  configurable: false
})

const bytefieldProcessor = require('bytefield-svg')

const encoding = 'utf-8'
let data

function convert() {
  const source = data.toString(encoding)
  if (source === '') {
    return
  }
  process.stdout.write(bytefieldProcessor(source))
}

const [, , ...args] = process.argv
if (args[0] === '--version') {
  const version = require('./package.json').dependencies['bytefield-svg']
  console.log(`bytefield ${version}`)
  process.exit(0)
}

if (process.stdin.isTTY) {
  // Even though executed by name, the first argument is still "node",
  // the second the script name. The third is the string we want.
  data = Buffer.from(process.argv[2] || '', encoding)
  convert()
} else {
  // Accepting piped content. E.g.:
  // echo "pass in this string as input" | ./example-script
  data = ''
  process.stdin.setEncoding(encoding)

  process.stdin.on('readable', () => {
    let chunk
    while ((chunk = process.stdin.read())) {
      data += chunk
    }
  })

  process.stdin.on('end', () => {
    // There will be a trailing \n from the user hitting enter. Get rid of it.
    data = data.replace(/\n$/, '')
    convert()
  })
}
