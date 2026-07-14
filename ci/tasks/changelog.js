#!/usr/bin/env node
// Changelog automation for the release workflow.
//
// Usage:
//   node ci/tasks/changelog.js release <version>   Roll "## [Unreleased]" into a dated
//                                                  "## [<version>]" section and start a
//                                                  fresh, empty "## [Unreleased]" section.
//   node ci/tasks/changelog.js notes <version>     Print the body of the "## [<version>]"
//                                                  section to stdout (used as release notes).
//
// The changelog follows the "Keep a Changelog" format.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const CHANGELOG_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'CHANGELOG.md',
)
const UNRELEASED_HEADING = '## [Unreleased]'

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

const [command, version] = process.argv.slice(2)
if (!version) {
  fail(`usage: node ci/tasks/changelog.js <release|notes> <version>`)
}
if (command === 'release') {
  release(version)
} else if (command === 'notes') {
  notes(version)
} else {
  fail(`unknown command "${command}" (expected "release" or "notes")`)
}