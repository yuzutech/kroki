# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changes land in the `Unreleased` section as part of the pull request that introduces them.
On release, the [Release workflow](.github/workflows/release.yml) rolls this section into a
versioned entry and uses it as the GitHub release notes.

## [Unreleased]

## [0.32.1] - 2026-08-12

### Security

- Prevent Vega diagrams from bypassing `KROKI_SAFE_MODE=SECURE`'s URL-loading restriction: the guard only inspected `spec.data` and the direct children of `spec.marks`, so a URL-bearing data definition nested inside a group mark (`marks[].marks[].data[].url`) reached Vega's loader unchecked, allowing SSRF and local file reads (e.g. `file:///etc/passwd`); separately, an `image` mark's `encode.*.url` (e.g. `encode.enter.url`) is fetched directly by the renderer and wasn't inspected at all, allowing SSRF (e.g. against cloud metadata endpoints) even without any `data` block. Fixed by recursively scanning every mark, however deeply nested, for a `url` on either `data` or `encode`

### Diagram libraries

- Update bpmn-js to 18.22.1

## [0.32.0] - 2026-08-03

### Added

- Add `background` and `transparent` options to Ditaa diagrams, to set the background colour of the image or make it transparent

### Security

- Prevent unauthenticated remote code execution on `/tikz/svg` via `\special{ps:...}`: `dvisvgm` hands PostScript specials embedded in the DVI off to Ghostscript, which `dvisvgm` starts with `-dDELAYSAFER` instead of `-dSAFER`, leaving the `%pipe%` device available and allowing arbitrary command execution regardless of `KROKI_SAFE_MODE` — including `SECURE`, since that setting only restricts kpathsea (LaTeX) file access and has no effect on Ghostscript. Fixed by passing `--no-specials=ps` to `dvisvgm` so PostScript specials are never processed
- Prevent BPMN diagram source from executing arbitrary HTML/JavaScript in the companion's headless Chromium page: the diagram source was assigned to the rendering container via `innerHTML` before being handed to bpmn-js, so a crafted request to `/bpmn/svg` could inject an element (e.g. `<img onerror=...>`) that ran script in that page; combined with the browser's `--disable-web-security` flag (same-origin policy disabled), that script could issue cross-origin requests and read the responses. Fixed by clearing the container instead of parsing the diagram source as HTML, and by dropping `--disable-web-security` — the only reason it was set, local file access, is already covered by the shared `--allow-file-access-from-files` flag ([#2089](https://github.com/yuzutech/kroki/pull/2089))
- Stop the headless Chromium instance shared by the Mermaid, BPMN, Excalidraw and diagrams.net companions from phoning home to Google (`update.googleapis.com`, `clients2.google.com`, `android.clients.google.com`, `accounts.google.com`, `www.google.com`) as soon as it launches: several independent Chromium subsystems (GCM device checkin, network-time sync, the component updater, ...) each reach out to their own Google endpoint, so disabling them one flag at a time (`--disable-component-update`, `--disable-domain-reliability`, `--no-pings`) still left some contacting Google — confirmed by packet capture. Fixed by blocking DNS resolution for those exact hosts at the browser level via `--host-resolver-rules` — not a `*.google.com`/`*.googleapis.com` wildcard, so it doesn't also block legitimate diagram-triggered subresources under the same domains (e.g. `fonts.googleapis.com`), which remain governed by the existing `KROKI_*_SAFE_MODE`/`*_ALLOWED_ORIGINS` request policy

### Changed

- Update Node.js base Docker images to 24.18 (Alpine 3.24) for the Mermaid, BPMN, Excalidraw and diagrams.net companions

### Fixed

- Prevent the headless Chromium instance shared by the Mermaid, BPMN, Excalidraw and diagrams.net companions from crashing once it exhausts Docker's default 64MB `/dev/shm`, by passing `--disable-dev-shm-usage` so Chromium falls back to `/tmp`
- Raise the core's HTTP connection pool towards each companion from Vert.x's default of 5 to 10 (configurable via `KROKI_DELEGATE_MAX_POOL_SIZE`), so a degraded companion (e.g. Mermaid restarting Chromium after a crash) doesn't starve unrelated requests of a pooled connection and fail them with a `getting a connection` timeout before the companion itself is actually overloaded

### Diagram libraries

- Update Vega to 6.3.1
- Update bpmn-js to 18.22.0 ([#2114](https://github.com/yuzutech/kroki/pull/2114))
- Update Mermaid to 11.16.0 ([#2119](https://github.com/yuzutech/kroki/pull/2119))
- Update WaveDrom to 3.6.2 ([#2122](https://github.com/yuzutech/kroki/pull/2122))

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
