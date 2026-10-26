#!/usr/bin/env node
// Changelog automation for the release workflow.
//
// Usage:
//   node ci/tasks/changelog.js release <version>   Roll "## [Unreleased]" into a dated
//                                                  "## [<version>]" section and start a
//                                                  fresh, empty "## [Unreleased]" section.
//   node ci/tasks/changelog.js notes <version>     Print the body of the "## [<version>]"
//                                                  section to stdout (used as release notes).
//   node ci/tasks/changelog.js diagram-libraries <pr-number> <base-ref>
//                                                  Add an "Update <library> to <version>" entry under
//                                                  "### Diagram libraries" in "## [Unreleased]" for each
//                                                  version that changed in docs/antora.yml since <base-ref>
//                                                  (used on Renovate pull requests).
//
// The changelog follows the "Keep a Changelog" format.

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const CHANGELOG_PATH = join(ROOT_DIR, 'CHANGELOG.md')
const ANTORA_COMPONENT_PATH = 'docs/antora.yml'
const UNRELEASED_HEADING = '## [Unreleased]'
const DIAGRAM_LIBRARIES_HEADING = '### Diagram libraries'
const PULL_REQUEST_URL = 'https://github.com/yuzutech/kroki/pull'

// display name of the diagram libraries, by <name>-version attribute of docs/antora.yml
// (actdiag, nwdiag, packetdiag, rackdiag and seqdiag ship with blockdiag, c4plantuml with plantuml)
const DIAGRAM_LIBRARY_NAMES = {
  blockdiag: 'blockdiag',
  bpmn: 'bpmn-js',
  bytefield: 'bytefield-svg',
  d2: 'D2',
  dbml: 'dbml-renderer',
  diagramsnet: 'diagrams.net',
  ditaa: 'ditaa',
  erd: 'erd',
  excalidraw: 'Excalidraw',
  goat: 'GoAT',
  graphviz: 'Graphviz',
  lini: 'Lini',
  mermaid: 'Mermaid',
  nomnoml: 'nomnoml',
  pikchr: 'Pikchr',
  plantuml: 'PlantUML',
  structurizr: 'Structurizr',
  svgbob: 'Svgbob',
  symbolator: 'Symbolator',
  umlet: 'UMLet',
  vega: 'Vega',
  vegalite: 'Vega-Lite',
  wavedrom: 'WaveDrom',
  wireviz: 'WireViz',
}

function fail(message) {
  console.error(`changelog: ${message}`)
  process.exit(1)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function release(version) {
  const content = readFileSync(CHANGELOG_PATH, 'utf8')
  if (!content.includes(UNRELEASED_HEADING)) {
    fail(`no "${UNRELEASED_HEADING}" section found in CHANGELOG.md`)
  }
  if (content.includes(`## [${version}]`)) {
    fail(`a section for version ${version} already exists in CHANGELOG.md`)
  }
  // Keep an empty Unreleased section on top and move its current content under the new version.
  const updated = content.replace(
    UNRELEASED_HEADING,
    `${UNRELEASED_HEADING}\n\n## [${version}] - ${today()}`,
  )
  writeFileSync(CHANGELOG_PATH, updated)
  console.error(`changelog: released ${version}`)
}

function notes(version) {
  const lines = readFileSync(CHANGELOG_PATH, 'utf8').split('\n')
  const start = lines.findIndex((line) => line.startsWith(`## [${version}]`))
  if (start === -1) {
    fail(`no section for version ${version} found in CHANGELOG.md`)
  }
  let end = lines.findIndex(
    (line, index) => index > start && line.startsWith('## '),
  )
  if (end === -1) {
    end = lines.length
  }
  process.stdout.write(
    `${lines
      .slice(start + 1, end)
      .join('\n')
      .trim()}\n`,
  )
}

function parseDiagramLibraryVersions(antoraComponentContent) {
  const versions = {}
  for (const line of antoraComponentContent.split('\n')) {
    const found = line.match(/^\s+(?<name>[a-z0-9]+)-version: '?(?<version>[^'\s]+)'?$/)
    if (found) {
      versions[found.groups.name] = found.groups.version
    }
  }
  return versions
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function diagramLibraries(pullRequestNumber, baseRef) {
  const baseVersions = parseDiagramLibraryVersions(
    execFileSync('git', ['show', `${baseRef}:${ANTORA_COMPONENT_PATH}`], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    }),
  )
  const versions = parseDiagramLibraryVersions(
    readFileSync(join(ROOT_DIR, ANTORA_COMPONENT_PATH), 'utf8'),
  )
  const link = `([#${pullRequestNumber}](${PULL_REQUEST_URL}/${pullRequestNumber}))`
  const entries = Object.entries(versions)
    .filter(([name, version]) => name in DIAGRAM_LIBRARY_NAMES && baseVersions[name] !== version)
    .map(([name, version]) => ({
      // an entry of this pull request for an older version is replaced (Renovate updated the pull request)
      pattern: new RegExp(`^- Update ${escapeRegExp(DIAGRAM_LIBRARY_NAMES[name])} to \\S+ ${escapeRegExp(link)}$`),
      line: `- Update ${DIAGRAM_LIBRARY_NAMES[name]} to ${version} ${link}`,
    }))
  if (entries.length === 0) {
    console.error('changelog: no diagram library version changed')
    return
  }

  const lines = readFileSync(CHANGELOG_PATH, 'utf8').split('\n')
  const start = lines.indexOf(UNRELEASED_HEADING)
  if (start === -1) {
    fail(`no "${UNRELEASED_HEADING}" section found in CHANGELOG.md`)
  }
  let end = lines.findIndex((line, index) => index > start && line.startsWith('## '))
  if (end === -1) {
    end = lines.length
  }
  let heading = lines.indexOf(DIAGRAM_LIBRARIES_HEADING, start)
  if (heading === -1 || heading > end) {
    // "Diagram libraries" is the last category of a release section
    while (end - 1 > start && lines[end - 1] === '') {
      end--
    }
    lines.splice(end, 0, '', DIAGRAM_LIBRARIES_HEADING)
    heading = end + 1
  }
  let sectionEnd = lines.findIndex((line, index) => index > heading && line.startsWith('#'))
  if (sectionEnd === -1) {
    sectionEnd = lines.length
  }
  for (const { pattern, line } of entries) {
    const existing = lines.findIndex(
      (current, index) => index > heading && index < sectionEnd && pattern.test(current),
    )
    if (existing !== -1) {
      lines[existing] = line
      continue
    }
    let insertAt = sectionEnd
    while (insertAt - 1 > heading && lines[insertAt - 1] === '') {
      insertAt--
    }
    if (insertAt === heading + 1) {
      // empty section: keep a blank line after the heading
      lines.splice(insertAt, 0, '')
      insertAt++
      sectionEnd++
    }
    lines.splice(insertAt, 0, line)
    sectionEnd++
  }
  // keep a blank line before the next section
  if (sectionEnd < lines.length && lines[sectionEnd - 1] !== '') {
    lines.splice(sectionEnd, 0, '')
  }
  writeFileSync(CHANGELOG_PATH, lines.join('\n'))
  for (const { line } of entries) {
    console.error(`changelog: ${line}`)
  }
}

const [command, ...args] = process.argv.slice(2)
if (command === 'diagram-libraries') {
  if (args.length !== 2) {
    fail('usage: node ci/tasks/changelog.js diagram-libraries <pr-number> <base-ref>')
  }
  diagramLibraries(...args)
} else if (command === 'release' || command === 'notes') {
  const [version] = args
  if (!version) {
    fail(`usage: node ci/tasks/changelog.js <release|notes> <version>`)
  }
  if (command === 'release') {
    release(version)
  } else {
    notes(version)
  }
} else {
  fail(`unknown command "${command}" (expected "release", "notes" or "diagram-libraries")`)
}