#!/usr/bin/env node

import { promises as fs } from 'fs'
import * as url from 'url'
import ospath from 'path'
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'

const KROKI_UBUNTU_VERSION = 'jammy'
const require = createRequire(import.meta.url)
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const rootDir = ospath.join(__dirname, '..', '..')
const krokiServicePath = ospath.join(rootDir, 'server', 'src', 'main', 'java', 'io', 'kroki', 'server', 'service')

const diagramLibraryVersions = {}

function getDependencyVersion (pkg, name) {
  if (name in pkg.dependencies) {
    return pkg.dependencies[name]
  }
  return pkg.devDependencies[name]
}

async function updateServiceGetVersion (javaServiceFileName, version) {
  const servicePath = ospath.join(krokiServicePath, javaServiceFileName)
  const javaContent = await fs.readFile(servicePath, 'utf8')
  const versionFound = javaContent.match(/(?<= +public String getVersion\(\) {\n\s+return ")(?<version>[0-9.]+)(?=";\n\s+})/)
  if (versionFound) {
    const currentVersion = versionFound.groups.version
    if (currentVersion !== version) {
      const updatedJavaContent = javaContent.replace(/(?<= +public String getVersion\(\) {\n\s+return ")(?<version>[0-9.]+)(?=";\n\s+})/, version)
      await fs.writeFile(servicePath, updatedJavaContent, 'utf8')
    }
  }
}

async function updateVegaServiceGetVersion (vegaVersion, vegaLiteVersion) {
  // update vega version
  const servicePath = ospath.join(krokiServicePath, 'Vega.java')
  let javaContent = await fs.readFile(servicePath, 'utf8')
  const vegaVersionFound = javaContent.match(/(?<= +public String getVersion\(\) {\n\s+if \(specFormat == SpecFormat.DEFAULT\) {\n\s+return ")(?<version>[0-9.]+)/)
  if (vegaVersionFound) {
    const currentVersion = vegaVersionFound.groups.version
    if (currentVersion !== vegaVersion) {
      javaContent = javaContent.replace(/(?<= +public String getVersion\(\) {\n\s+if \(specFormat == SpecFormat.DEFAULT\) {\n\s+return ")(?<version>[0-9.]+)/, vegaVersion)
    }
  }
  // update vega lite version
  const vegaLiteVersionFound = javaContent.match(/(?<= +public String getVersion\(\) {\n\s+if \(specFormat == SpecFormat.DEFAULT\) {\n\s+return "[0-9.]+";\n\s+} else {\n\s+return )(?<version>"[0-9.]+)/)
  if (vegaLiteVersionFound) {
    const currentVersion = vegaLiteVersionFound.groups.version
    if (currentVersion !== vegaLiteVersion) {
      javaContent = javaContent.replace(/(?<= +public String getVersion\(\) {\n\s+if \(specFormat == SpecFormat.DEFAULT\) {\n\s+return "[0-9.]+";\n\s+} else {\n\s+return ")(?<version>[0-9.]+)/, vegaLiteVersion)
    }
  }
  await fs.writeFile(servicePath, javaContent, 'utf8')
}

async function mvnEvaluateExpression (expression, pomRootRelativePath) {
  if (pomRootRelativePath === undefined) {
    pomRootRelativePath = ospath.join('server', 'pom.xml')
  }
  const mvnProcess = spawn('mvn', ['-q', '-DforceStdout', '-f', ospath.join(rootDir, pomRootRelativePath), 'help:evaluate', `-Dexpression=${expression}`])
  const stderr = []
  mvnProcess.stderr.on('data', (chunk) => {
    stderr.push(chunk)
  })
  const stdout = []
  mvnProcess.stdout.on('data', (chunk) => {
    stdout.push(chunk)
  })
  return new Promise((resolve, reject) => {
    mvnProcess.on('error', (error) => {
      reject(error)
    })
    mvnProcess.on('exit', (exitCode) => {
      if (exitCode !== 0) {
        reject(stderr.join(''))
        return
      }
      resolve({ value: stdout.join('') })
    })
  })
}

function addDiagramLibraryPackageVersion (diagramName, dependencyName, directoryName) {
  if (directoryName === undefined) {
    directoryName = diagramName
  }
  if (dependencyName === undefined) {
    dependencyName = diagramName
  }
  const pkg = require(ospath.join(rootDir, directoryName, 'package.json'))
  const version = getDependencyVersion(pkg, dependencyName)
  diagramLibraryVersions[diagramName] = version
  return version
}

const diagramLibraryNames = [
  'actdiag',
  'blockdiag',
  'bpmn',
  'bytefield',
  'd2',
  'dbml',
  'diagramsnet',
  'ditaa',
  'erd',
  'excalidraw',
  'graphviz',
  'mermaid',
  'nomnoml',
  'nwdiag',
  'packetdiag',
  'pikchr',
  'plantuml',
  'rackdiag',
  'seqdiag',
  'structurizr',
  'svgbob',
  'umlet',
  'vega',
  'vegalite',
  'wavedrom',
  'wireviz'
]

try {
  // GET CURRENT VERSION
  const blockdiagRequirementsContent = await fs.readFile(ospath.join(rootDir, 'blockdiag', 'requirements.txt'), 'utf8')
  for (const line of blockdiagRequirementsContent.split('\n')) {
    const found = line.match(/^(?<name>[a-zA-Z]+)==(?<version>.*)$/)
    if (found) {
      const { name, version } = found.groups
      if (diagramLibraryNames.includes(name)) {
        if (name === 'nwdiag') {
          // this package also includes rackdiag and packetdiag
          diagramLibraryVersions.rackdiag = version
          diagramLibraryVersions.packetdiag = version
        }
        diagramLibraryVersions[name] = version
      }
    }
  }

  const wirevizRequirementsContent = await fs.readFile(ospath.join(rootDir, 'wireviz', 'requirements.txt'), 'utf8')
  for (const line of wirevizRequirementsContent.split('\n')) {
    const found = line.match(/^(?<name>[a-zA-Z]+)==(?<version>.*)$/)
    if (found) {
      const { name, version } = found.groups
      if (diagramLibraryNames.includes(name)) {
        diagramLibraryVersions[name] = version
      }
    }
  }

  addDiagramLibraryPackageVersion('bpmn', 'bpmn-js')
  addDiagramLibraryPackageVersion('bytefield', 'bytefield-svg')
  addDiagramLibraryPackageVersion('dbml', '@softwaretechnik/dbml-renderer')
  addDiagramLibraryPackageVersion('excalidraw', '@excalidraw/excalidraw')
  addDiagramLibraryPackageVersion('mermaid')
  addDiagramLibraryPackageVersion('nomnoml')
  addDiagramLibraryPackageVersion('vega')
  addDiagramLibraryPackageVersion('vegalite', 'vega-lite', 'vega')
  addDiagramLibraryPackageVersion('wavedrom')

  const diagramsnetAppContent = await fs.readFile(ospath.join(rootDir, 'diagrams.net', 'assets', 'js', 'app.min.js'), 'utf8')
  const diagramsnetVersionFound = diagramsnetAppContent.matchAll(/EditorUi\.VERSION="(?<version>[0-9.]+)"/g)
  if (diagramsnetVersionFound) {
    diagramLibraryVersions.diagramsnet = [...diagramsnetVersionFound][0].groups.version
  }

  const dockerfileContent = await fs.readFile(ospath.join(rootDir, 'server', 'ops', 'docker', 'jdk11-jammy', 'Dockerfile'), 'utf8')
  for (const line of dockerfileContent.split('\n')) {
    const erdVersionFound = line.match(/^FROM yuzutech\/kroki-builder-erd:(?<version>\S+) as kroki-builder-static-erd$/)
    if (erdVersionFound) {
      const { version } = erdVersionFound.groups
      diagramLibraryVersions.erd = version
    }
    const pikchrVersionFound = line.match(/^ARG PIKCHR_VERSION=(?<version>.+)$/)
    if (pikchrVersionFound) {
      const { version } = pikchrVersionFound.groups
      diagramLibraryVersions.pikchr = version.slice(0, 10)
    }
    const umletVersionFound = line.match(/^ARG UMLET_VERSION=(?<version>.+)$/)
    if (umletVersionFound) {
      const { version } = umletVersionFound.groups
      diagramLibraryVersions.umlet = version.split('+')[0]
    }
  }

  const d2GoModContent = await fs.readFile(ospath.join(rootDir, 'server', 'ops', 'docker', 'go.mod'), 'utf8')
  for (const line of d2GoModContent.split('\n')) {
    const d2VersionFound = line.match(/^require oss.terrastruct.com\/d2 v(?<version>.+)$/)
    if (d2VersionFound) {
      const { version } = d2VersionFound.groups
      diagramLibraryVersions.d2 = version
    }
  }

  const svgbobCargoContent = await fs.readFile(ospath.join(rootDir, 'server', 'ops', 'docker', 'Cargo.toml'), 'utf8')
  for (const line of svgbobCargoContent.split('\n')) {
    const svgbobVersionFound = line.match(/^svgbob_cli\s*=\s*"(?<version>.+)"$/)
    if (svgbobVersionFound) {
      const { version } = svgbobVersionFound.groups
      diagramLibraryVersions.svgbob = version
    }
  }

  const { value: plantumlVersion } = await mvnEvaluateExpression('plantuml.version')
  diagramLibraryVersions.plantuml = plantumlVersion

  const { value: structurizrVersion } = await mvnEvaluateExpression('structurizr-dsl.version')
  diagramLibraryVersions.structurizr = structurizrVersion

  const { value: ditaaVersion } = await mvnEvaluateExpression('ditaa-mini.version')
  diagramLibraryVersions.ditaa = ditaaVersion

  // GraphViz version
  const ubuntuPackagesUrl = `https://packages.ubuntu.com/${KROKI_UBUNTU_VERSION}/graphviz`
  const ubuntuPackagesResponse = await fetch(ubuntuPackagesUrl)
  if (ubuntuPackagesResponse.status >= 200 && ubuntuPackagesResponse.status < 400) {
    const ubuntuPackagesContent = await ubuntuPackagesResponse.text()
    const found = ubuntuPackagesContent.match(/Package: graphviz \((?<version>[0-9.]+)-[0-9]+\)/)
    if (found) {
      const { version } = found.groups
      diagramLibraryVersions.graphviz = version
    }
  } else {
    console.error(`Unable to GET ${ubuntuPackagesUrl} - ${ubuntuPackagesResponse.status} ${ubuntuPackagesResponse.statusText} - ${await ubuntuPackagesResponse.text()}`)
    process.exit(1)
  }

  console.log({
    diagramLibraryVersions: Object.fromEntries(Object.entries(diagramLibraryVersions).sort((a, b) => a[0].localeCompare(b[0]))),
    count: Object.keys(diagramLibraryVersions).length
  })

  // UPDATE
  const antoraComponentLines = []
  const antoraComponentPath = ospath.join(rootDir, 'docs', 'antora.yml')
  const antoraComponentContent = await fs.readFile(antoraComponentPath, 'utf8')
  for (let line of antoraComponentContent.split('\n')) {
    const found = line.match(/^\s+(?<name>[a-z]+)-version: '?(?<version>[^']+)'?$/)
    if (found) {
      const { name, version : versionFound } = found.groups
      const version = diagramLibraryVersions[name]
      if (versionFound !== version) {
        line = line.replace(/(?<=^\s+(?<name>[a-z]+)-version: '?)(?<version>[^']+)/, version)
      }
    }
    antoraComponentLines.push(line)
  }
  await fs.writeFile(antoraComponentPath, antoraComponentLines.join('\n'), 'utf8')
  await updateServiceGetVersion('Blockdiag.java', diagramLibraryVersions.blockdiag)
  await updateServiceGetVersion('Bpmn.java', diagramLibraryVersions.bpmn)
  await updateServiceGetVersion('Bytefield.java', diagramLibraryVersions.bytefield)
  await updateServiceGetVersion('D2.java', diagramLibraryVersions.d2)
  await updateServiceGetVersion('Dbml.java', diagramLibraryVersions.dbml)
  await updateServiceGetVersion('Ditaa.java', diagramLibraryVersions.ditaa)
  await updateServiceGetVersion('Erd.java', diagramLibraryVersions.erd)
  await updateServiceGetVersion('Excalidraw.java', diagramLibraryVersions.excalidraw)
  await updateServiceGetVersion('Graphviz.java', diagramLibraryVersions.graphviz)
  await updateServiceGetVersion('Mermaid.java', diagramLibraryVersions.mermaid)
  await updateServiceGetVersion('Nomnoml.java', diagramLibraryVersions.nomnoml)
  await updateServiceGetVersion('Pikchr.java', diagramLibraryVersions.pikchr)
  await updateServiceGetVersion('Structurizr.java', diagramLibraryVersions.structurizr)
  await updateServiceGetVersion('Svgbob.java', diagramLibraryVersions.svgbob)
  await updateServiceGetVersion('Umlet.java', diagramLibraryVersions.umlet)
  await updateServiceGetVersion('Wavedrom.java', diagramLibraryVersions.wavedrom)
  await updateServiceGetVersion('Wireviz.java', diagramLibraryVersions.wireviz)
  await updateVegaServiceGetVersion(diagramLibraryVersions.vega, diagramLibraryVersions.vegalite)

} catch (err) {
  console.error(err)
  process.exit(1)
}
