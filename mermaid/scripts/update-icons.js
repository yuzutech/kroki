#!/usr/bin/env node
// Download the Iconify "logos" icon pack registered in assets/index.html.
// Usage: npm run update-icons [-- <version>] (defaults to the latest version)
import { writeFile } from 'node:fs/promises'

const version = process.argv[2] || 'latest'
const url = `https://unpkg.com/@iconify-json/logos@${version}/icons.json`
const output = new URL('../assets/icons.json', import.meta.url)

const response = await fetch(url)
if (!response.ok) {
  console.error(`Unable to download ${url}: ${response.status} ${response.statusText}`)
  process.exit(1)
}
const icons = await response.json()
if (icons.prefix !== 'logos' || typeof icons.icons !== 'object') {
  console.error(`Unexpected content from ${url}: not the Iconify "logos" icon pack`)
  process.exit(1)
}
await writeFile(output, `${JSON.stringify(icons, null, 2)}\n`)
// unpkg redirects "latest" (or a semver range) to the resolved version
console.log(
  `Updated assets/icons.json from ${response.url} (${Object.keys(icons.icons).length} icons)`
)
