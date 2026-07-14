# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changes land in the `Unreleased` section as part of the pull request that introduces them.
On release, the [Release workflow](.github/workflows/release.yml) rolls this section into a
versioned entry and uses it as the GitHub release notes.

## [Unreleased]

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
