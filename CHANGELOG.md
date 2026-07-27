# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changes land in the `Unreleased` section as part of the pull request that introduces them.
On release, the [Release workflow](.github/workflows/release.yml) rolls this section into a
versioned entry and uses it as the GitHub release notes.

## [Unreleased]

### Added

- Add `background` and `transparent` options to Ditaa diagrams, to set the background colour of the image or make it transparent

## [0.31.2] - 2026-07-26

### Security

- Prevent TikZ diagrams in secure mode from reading arbitrary files on the container filesystem via `\input`, `\include`, `\openin`/`\read`, `\lstinputlisting` and similar LaTeX file-access primitives, by restricting kpathsea's `openin_any`/`openout_any` to the current working directory instead of only blocklisting `\verbatiminput`
- Prevent Mermaid flowchart image-shape nodes (`N@{ img: "URL" }`) from making the companion's headless Chromium fetch an attacker-controlled URL on `/svg` and `/png`, by wiring `KROKI_MERMAID_SAFE_MODE`/`KROKI_SAFE_MODE` into a shared Puppeteer request-interception policy (`applyNetworkPolicy`) that restricts requests to `file:`/`data:`/same-origin plus an optional operator-configured allowlist (`KROKI_MERMAID_ALLOWED_ORIGINS` / `KROKI_ALLOWED_ORIGINS`)

### Changed

- Update Node.js base Docker images to 24.18 (Bookworm) ([#2097](https://github.com/yuzutech/kroki/pull/2097))

### Fixed

- Cap concurrent Mermaid conversions (`KROKI_MERMAID_MAX_CONCURRENCY`, default 6) to bound Chromium memory usage; a burst of simultaneous requests could otherwise spin up enough renderer processes to exceed the container's memory limit and crash the service

### Diagram libraries

- Update Structurizr to 6.2.2 ([#2099](https://github.com/yuzutech/kroki/pull/2099))

## [0.31.1] - 2026-07-15

### Changed

- Update Node.js base Docker images to 24.18 (Alpine) and 24.17 (Bookworm) ([#2093](https://github.com/yuzutech/kroki/pull/2093))

### Fixed

- Preserve leading whitespace of the first line in GoAT diagrams ([#2086](https://github.com/yuzutech/kroki/pull/2086))

### Diagram libraries

- Update blockdiag to 3.4.2 ([#2085](https://github.com/yuzutech/kroki/pull/2085))

## [0.31.0] - 2026-06-11

This release adds support for GoAT diagrams and brings back the ELK and tidy-tree layouts in Mermaid 🎉

### Added

- Integrate GoAT (Go ASCII diagrams) ([#2033](https://github.com/yuzutech/kroki/pull/2033))
- Support ELK and tidy-tree alternate layouts in Mermaid ([#2080](https://github.com/yuzutech/kroki/pull/2080))

### Fixed

- Prevent browser leak and bound resource usage in companion containers ([#2076](https://github.com/yuzutech/kroki/pull/2076))

### Diagram libraries

- blockdiag (actdiag, nwdiag, packetdiag, rackdiag, seqdiag) 3.3.0
- BPMN 18.18.0
- diagrams.net 29.6.1
- Excalidraw 0.18.1
- GraphViz 14.1.3
- Mermaid 11.15.0
- PlantUML (and C4) 1.2026.6
- Structurizr 6.2.1
- Vega-Lite 6.4.3
- WaveDrom 3.6.1
