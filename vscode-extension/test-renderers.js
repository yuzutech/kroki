const fs = require('fs')
const zlib = require('zlib')
const { extractMarkdownDiagrams, supportedEngines } = require('./diagram-parser')

const root = `${__dirname}/..`
const server = fs.readFileSync(`${root}/server/src/main/java/io/kroki/server/Server.java`, 'utf8')
const markdown = fs.readFileSync(`${root}/all-diagrams.md`, 'utf8')
const registered = [...server.matchAll(/registry\.register\([^;]+?((?:"[a-z0-9-]+"(?:,\s*)?)+)\);/gs)]
  .flatMap(match => [...match[1].matchAll(/"([a-z0-9-]+)"/g)].map(name => name[1]))
const diagrams = extractMarkdownDiagrams(markdown)
const parsed = new Set(diagrams.map(item => item.engine))
const missingInExtension = registered.filter(engine => engine !== 'dot' && !supportedEngines.includes(engine))
const missingExamples = registered.filter(engine => engine !== 'dot' && !parsed.has(engine))

if (diagrams.length !== 31 || missingInExtension.length || missingExamples.length) {
  console.error({ diagrams:diagrams.length, missingInExtension, missingExamples })
  process.exit(1)
}

async function renderAll() {
  if (!process.env.CODE_TO_UML_TEST_URL) return
  const base = process.env.CODE_TO_UML_TEST_URL.replace(/\/$/, '')
  const failures = []
  for (const diagram of diagrams) {
    const encoded = zlib.deflateSync(Buffer.from(diagram.source), { level:9 }).toString('base64url')
    const response = await fetch(`${base}/${diagram.engine}/svg/${encoded}`)
    if (!response.ok) failures.push(`${diagram.engine}: HTTP ${response.status}`)
  }
  if (failures.length) throw new Error(failures.join('\n'))
}

renderAll().then(() => console.log(`Renderer coverage OK: ${registered.length} endpoints, ${diagrams.length} examples.`)).catch(error => { console.error(error);process.exit(1) })
