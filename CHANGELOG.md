# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changes land in the `Unreleased` section as part of the pull request that introduces them.
On release, the [Release workflow](.github/workflows/release.yml) rolls this section into a
versioned entry and uses it as the GitHub release notes.

## [Unreleased]

### Security

- Prevent diagrams.net image-shape nodes (`shape=image;image=URL`) and background images, as well as Excalidraw image elements, from making the companion's headless Chromium fetch an attacker-controlled URL (server-side request forgery), by applying the request-interception policy already used by the Mermaid companion to the diagrams.net, Excalidraw and BPMN companions: requests are restricted to `file:`/`data:`/same-origin plus an optional operator-configured allowlist (`KROKI_DIAGRAMSNET_ALLOWED_ORIGINS`, `KROKI_EXCALIDRAW_ALLOWED_ORIGINS`, `KROKI_BPMN_ALLOWED_ORIGINS` / `KROKI_ALLOWED_ORIGINS`) unless the gateway runs in `UNSAFE` mode (`KROKI_DIAGRAMSNET_SAFE_MODE`, `KROKI_EXCALIDRAW_SAFE_MODE`, `KROKI_BPMN_SAFE_MODE` / `KROKI_SAFE_MODE`). The diagrams.net companion now also takes the safe mode from the gateway, instead of its own `KROKI_SAFE_MODE` environment variable, to decide whether to inline the images referenced by the diagram ([#2225](https://github.com/yuzutech/kroki/pull/2225))

### Changed

- Update the `yuzutech/kroki` base image to Ubuntu 26.04 LTS (`eclipse-temurin:21.0.12.1_1-jre-resolute`, previously `21.0.9_10-jre-noble`), with dvisvgm 3.6 for TikZ diagrams ([#2209](https://github.com/yuzutech/kroki/pull/2209))

### Fixed

- Fix GoAT diagrams on `linux/arm64`: the `yuzutech/kroki` arm64 image shipped an x86-64 `goat` binary, because it was built for the build platform instead of the target platform ([#2186](https://github.com/yuzutech/kroki/pull/2186))
- Fix UMLet custom drawings, rendered as `java.lang.NullPointerException`, and "all in one" activity and sequence elements, rendered almost empty: UMLet is now built from the upstream 15.1 sources (Kroki reported 15.1 but shipped a fork of UMLet 15.0) ([#2223](https://github.com/yuzutech/kroki/pull/2223))
- Stop installing a C/C++ toolchain (`gcc`, `build-essential`, ...) and development packages in the `yuzutech/kroki` image, pulled by a misspelled `libgirepository` package name (about 240 MB smaller) ([#2199](https://github.com/yuzutech/kroki/pull/2199))
- Report the Pikchr and GoAT versions shipped in the image in `/health` (and in the HTTP cache key): Pikchr reported an older `pikchr.c` artifact (`7269f78c4a` instead of `85e65b9686`) and GoAT reported `undefined` instead of 0.5.1 ([#2205](https://github.com/yuzutech/kroki/pull/2205))

### Diagram libraries

- Update D2 to 0.9.0 ([#2192](https://github.com/yuzutech/kroki/pull/2192))
- Update erd to 0.2.2, built from the upstream release sources (Kroki reported 0.2.3 but actually shipped erd 0.2.1.0) ([#2188](https://github.com/yuzutech/kroki/pull/2188))
- Update PlantUML (and C4-PlantUML) to 1.2026.9 ([#2190](https://github.com/yuzutech/kroki/pull/2190))
- Update Vega-Lite to 6.5.0 ([#2195](https://github.com/yuzutech/kroki/pull/2195))
- Update bpmn-js to 18.31.1 ([#2211](https://github.com/yuzutech/kroki/pull/2211))
- Update Structurizr to 6.2.4 ([#2216](https://github.com/yuzutech/kroki/pull/2216))
- Update WaveDrom to 3.8.0 ([#2217](https://github.com/yuzutech/kroki/pull/2217))

## [0.34.0] - 2026-10-25

### Added

- Add support for [Lini](https://lini.rs) diagrams (`lini`), with `theme` and `static` options. Local image paths are refused unless `KROKI_SAFE_MODE` is `unsafe` ([#2169](https://github.com/yuzutech/kroki/pull/2169))
- Add a `page` option to TikZ diagrams to render only the specified page in SVG, PNG and JPEG output ([#2167](https://github.com/yuzutech/kroki/pull/2167))

### Changed

- BPMN and diagrams.net conversions are now capped (`KROKI_BPMN_MAX_CONCURRENCY` and `KROKI_DIAGRAMSNET_MAX_CONCURRENCY`, default 6) to bound Chromium memory usage, and the BPMN, diagrams.net and Excalidraw wait queues are bounded like Mermaid's (`KROKI_<SERVICE>_MAX_QUEUE_SIZE`, default 100, and `KROKI_<SERVICE>_QUEUE_TIMEOUT`, default 30s): requests beyond these limits get a `503`. `KROKI_<SERVICE>_MAX_QUEUE_SIZE` can be set to `0` to reject requests immediately when every slot is busy ([#2182](https://github.com/yuzutech/kroki/pull/2182))

### Fixed

- Fix the Mermaid service running out of memory after Chromium crashes: a failure while connecting to the browser or opening a page leaked a concurrency slot, until every request waited forever. The wait queue is now also bounded (`KROKI_MERMAID_MAX_QUEUE_SIZE`, default 100, and `KROKI_MERMAID_QUEUE_TIMEOUT`, default 30s); rejected requests get a `503` ([#2183](https://github.com/yuzutech/kroki/pull/2183))
- Fix the Excalidraw container becoming unresponsive under load (`Runtime.callFunctionOn timed out`, `Target crashed`): pages are now initialized once and reused instead of loading the Excalidraw library for every request, conversions are capped (`KROKI_EXCALIDRAW_MAX_CONCURRENCY`, default 4) and a render taking longer than `KROKI_EXCALIDRAW_CONVERT_TIMEOUT` (default 15s) returns a `408` ([#2182](https://github.com/yuzutech/kroki/pull/2182))
- Fix the BPMN and diagrams.net services leaking their browser connection when opening a page failed ([#2182](https://github.com/yuzutech/kroki/pull/2182))
- Fix the Mermaid, BPMN, diagrams.net and Excalidraw containers ignoring `SIGTERM`: Chrome was closed but the Node.js process kept running (and relaunched Chrome on the next request), so `docker stop` had to wait for its grace period and kill the container. They now stop accepting connections and exit once in-flight conversions are done, or after 8 seconds ([#2182](https://github.com/yuzutech/kroki/pull/2182))
- Reduce log noise in the Chromium-based companion containers (Mermaid, BPMN, Excalidraw, diagrams.net): Chromium output is no longer written unformatted before the JSON logger, harmless Chromium messages (D-Bus, `SharedImageManager`, rejected IPC messages, crashpad dump collection) are logged at debug level, other Chromium output is logged as `warn` instead of `error`, and diagram syntax errors (already returned as a `400`) are logged at debug level instead of `error` ([#2184](https://github.com/yuzutech/kroki/pull/2184))

### Diagram libraries

- Update bpmn-js to 18.31.0 ([#2185](https://github.com/yuzutech/kroki/pull/2185))
- Update Mermaid to 12.2.0 ([#2185](https://github.com/yuzutech/kroki/pull/2185))

## [0.33.0] - 2026-10-05

### Changed

- Mermaid diagrams now use the ELK layout engine by default, as it is bundled with Mermaid 12 (the separate `@mermaid-js/layout-elk` package is no longer included). Use `layout=dagre` (or `layout: dagre` in the diagram frontmatter config) to restore the previous layout

### Diagram libraries

- Upgrade the bundled C4-PlantUML model files from 2.7.0 to 2.14.0, adding the `$borderStyle` and `$borderThickness` parameters for `AddElementTag`/`AddRelTag` (and every other change up to 2.14.0) to the `C4 with PlantUML` diagram type ([#2145](https://github.com/yuzutech/kroki/pull/2145))
- Update bpmn-js to 18.28.0
- Update Mermaid to 12.1.0
- Update the Iconify `logos` icon pack available in Mermaid diagrams to 1.2.15
- Update PlantUML to 1.2026.8
- Update Structurizr to 6.2.3
- Update Vega to 6.4.0
- Update WaveDrom to 3.7.0

## [0.32.1] - 2026-08-12

### Security

- Prevent Vega diagrams from bypassing `KROKI_SAFE_MODE=SECURE`'s URL-loading restriction: the guard only inspected `spec.data` and the direct children of `spec.marks`, so a URL-bearing data definition nested inside a group mark (`marks[].marks[].data[].url`) reached Vega's loader unchecked, allowing SSRF and local file reads (e.g. `file:///etc/passwd`); separately, an `image` mark's `encode.*.url` (e.g. `encode.enter.url`) is fetched directly by the renderer and wasn't inspected at all, allowing SSRF (e.g. against cloud metadata endpoints) even without any `data` block. Fixed by recursively scanning every mark, however deeply nested, for a `url` on either `data` or `encode`

### Diagram libraries

- Update bpmn-js to 18.22.1

## [0.32.0] - 2026-08-03

### Added

- Add `background` and `transparent` options to Ditaa diagrams, to set the background colour of the image or make it transparent
- Add companion service discovery: a companion container not built into Kroki can now register itself as a new diagram type via `POST /services` (with a heartbeat to stay registered, since the registry is in-memory and does not survive a restart). Disabled by default, opt in with `KROKI_ENABLE_COMPANION_DISCOVERY`; secure the registration API with `KROKI_COMPANION_REGISTRATION_TOKEN`. Always disabled while `KROKI_SAFE_MODE` is `SECURE` (the default, including on kroki.io) ([#1423](https://github.com/yuzutech/kroki/issues/1423))

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
