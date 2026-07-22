# AGENTS.md

Guidance for AI coding agents working in this repository. Treat the repository as a production-shaped Kroki fork that is being extended into the Diagram as Code platform defined by the project baselines.

## Project identity and current state

**Diagram as Code - Rendering Service and Toolchain** is a self-hosted platform that will expose a Diagram Gateway, use a minimally modified Kroki fork as its rendering backend, and integrate with VS Code and GitHub Actions.

The repository currently contains the Kroki rendering server, local renderers, companion services, CI, Docker builds, and public Kroki documentation. The Gateway, VS Code Extension, GitHub Action, and shared `.diagram.yml` tooling described in the design documents may be partially implemented or still planned. Verify the filesystem and code before describing a planned component as available.

## Sources of truth

| Priority | Document | Role |
|---:|---|---|
| 1 | [docs/SRS.md](docs/SRS.md) | Approved scope, functional requirements, NFRs, constraints, priorities, and use cases. |
| 2 | [docs/SDD.md](docs/SDD.md) | Target architecture, component design, API/data contracts, sequences, deployment model, and ADRs. |
| 3 | [docs/openapi.yaml](docs/openapi.yaml) | Machine-readable public Gateway API contract derived from the SRS and SDD. |
| 4 | [docs/TestPlan.md](docs/TestPlan.md) | Test strategy, environments, acceptance cases, priorities, and requirements traceability. |
| 5 | [docs/ImplementationPlan.md](docs/ImplementationPlan.md) | Phased implementation roadmap, dependencies, deliverables, exit criteria, risks, and execution order. |
| 6 | [README.adoc](README.adoc) | Current repository usage, layout, build, and run instructions. |
| 7 | [Antora documentation](docs/modules) | Current public installation, configuration, API usage, features, and architecture documentation. |
| 8 | [CHANGELOG.md](CHANGELOG.md) | Delivered user-visible changes and renderer version history. |
| 9 | [SECURITY.md](SECURITY.md) | Vulnerability reporting and disclosure policy. |
| 10 | [DOCKERHUB.md](DOCKERHUB.md), [DOCKERHUB-COMPANION.md](DOCKERHUB-COMPANION.md) | Container image descriptions. |

Do not create or refer to `docs/project/`; it does not belong to this repository. Project requirement and design baselines live directly in `docs/SRS.md` and `docs/SDD.md`.

## Session completion requirement

After any session that changes code or code-adjacent configuration, invoke [project-docs-maintenance](.agents/skills/project-docs-maintenance/SKILL.md) before the final response.

The maintenance pass must preserve document roles:

- Do not silently change `docs/SRS.md` to make non-conforming code appear correct. Requirement changes need an explicit product decision.
- Update `docs/SDD.md` when architecture, protocols, contracts, topology, or ADR decisions change.
- Update README/Antora/CHANGELOG for behavior that users can actually run now.

## Architecture guardrails

| Rule | Required behavior |
|---|---|
| Public entry point | Clients call Diagram Gateway. Kroki and companion services remain internal in the target architecture. |
| Gateway responsibility | Routing, validation, auth, authorization, rate limit, cache orchestration, error normalization, and observability. |
| Gateway runtime | Use Node.js 24, TypeScript, and Fastify 5 under `product/gateway/`; Kroki remains Java 25/Vert.x. |
| Kroki fork responsibility | Engine registry, rendering, command execution, companion delegation, renderer security, version metadata, and structured renderer errors. |
| Minimal fork | Prefer Gateway logic or configuration over deep Kroki changes. Document every necessary fork patch. |
| Renderer topology | Preserve the hybrid model unless an ADR changes it: PlantUML in JVM, Graphviz/D2 bounded child processes, Mermaid in a companion container. |
| Communication | Use synchronous HTTP for Gateway-to-Kroki and Kroki-to-companion calls in the MVP; do not add a message broker without an ADR. |
| Cache | Cache key includes engine, format, source/options hash, tenant partition, renderer version, and sanitizer version. Never use private source text as a plaintext key. |
| Security | Enforce body, timeout, concurrency, and process limits; disable unsafe includes; sanitize SVG; do not log source or credentials. |
| Client consistency | VS Code Extension and GitHub Action use the same Gateway contract and `.diagram.yml` schema/path planner. |
| Generated output | Source text is authoritative. Generated SVG/PNG is reproducible output; PR checks do not write by default. |

## Repository structure

| Path | Purpose |
|---|---|
| `server/` | Java 25 Vert.x Kroki server, engine registry, local renderers, delegation, health, metrics, and tests. |
| `product/gateway/` | TypeScript/Fastify Diagram Gateway and HTTP contract tests. |
| `product/packages/` | Shared render contracts and project configuration parser. |
| `product/vscode-extension/` | VS Code live preview and export integration. |
| `product/github-action/` | Bundled GitHub Action for repository checks and generation workflows. |
| `product/deploy/` | Product Docker Compose topology and environment examples. |
| `mermaid/` | Node.js Mermaid companion service using Puppeteer/Chromium. |
| `bpmn/` | BPMN companion service. |
| `excalidraw/` | Excalidraw companion service. |
| `diagrams.net/` | diagrams.net companion service. |
| `bytefield/`, `dbml/`, `nomnoml/`, `wavedrom/` | Node.js renderer CLI packages. |
| `vega/` | Deno-based Vega/Vega-Lite renderer. |
| `tikz/` | TikZ renderer assets/build. |
| `ci/` | Smoke tests, version update scripts, and test Compose topology. |
| `.github/workflows/` | CI, release, docs, nightly, and security workflows. |
| `docs/SRS.md` | Approved software requirements baseline. |
| `docs/SDD.md` | Software design and ADR baseline. |
| `docs/openapi.yaml` | Machine-readable public Gateway API contract. |
| `docs/TestPlan.md` | Test strategy, environments and acceptance test baseline. |
| `docs/ImplementationPlan.md` | Phased implementation roadmap and completion gates. |
| `docs/modules/` | Antora public documentation and deployment examples. |
| `docker-bake.hcl` | Docker image build targets. |
| `Taskfile.yml` | Cross-platform build, image, smoke-test, and version tasks. |

When new platform modules are implemented, follow the boundaries in `docs/SDD.md`. Do not assume a directory exists until it is present in the repository.

## Build and test commands

Use repository-provided wrappers and tasks. Do not introduce a Python virtualenv; this is a Java/Node.js/Deno project.

| Purpose | Command |
|---|---|
| Build server and run Maven tests | `task mavenBuild` |
| Maven tests on Windows | `mvnw.cmd --no-transfer-progress test` |
| Maven tests on Linux/macOS | `./mvnw --no-transfer-progress test` |
| Install/build renderer dependencies | `task npmInstall` |
| Build Docker images | `task dockerBuildImages` |
| Full Docker smoke test | `task smokeTests` |
| Root smoke-test runner when services already run | `npm test` |
| Install product dependencies from lockfile | `npm ci --prefix product` |
| Product typecheck, unit tests and build | `npm run typecheck --prefix product`, `npm test --prefix product`, `npm run build --prefix product` |
| Product renderer smoke test | `npm run smoke --prefix product` |
| Update pinned renderer versions | `task updateVersions` |

Run the smallest relevant test first, then broaden based on blast radius. Full smoke tests build and start multiple images and are proportionally expensive.

## Engineering guidelines

| Rule | Apply it this way |
|---|---|
| Read before changing | Inspect the service, tests, SRS, and relevant SDD section before choosing an implementation. |
| Preserve upstream compatibility | Keep changes narrowly scoped and avoid unrelated refactors in forked Kroki code. |
| Use established abstractions | Add engines through `DiagramService`/`DiagramRegistry`; use `Commander` for bounded CLI execution and `Delegator` for companion HTTP calls. |
| Validate at trust boundaries | Gateway validates public requests; Kroki validates engine-specific input and output. Do not assume one replaces the other. |
| Keep errors actionable | Preserve request IDs and renderer detail, but never return production stack traces or credentials. |
| Pin behavior | Renderer versions and output-affecting options participate in cache/stale-output semantics. |
| Protect asynchronous code | Propagate deadlines, release semaphores in `finally`, and discard stale VS Code preview responses. |
| Test by risk | Cover valid input, syntax error, timeout, oversized input, unavailable companion, and supported output formats. |
| Preserve user work | Do not revert unrelated changes or rewrite vendored/generated assets unless required. |

## Documentation map

| Change | Documentation to review |
|---|---|
| Product scope, priority, use case, NFR | `docs/SRS.md`; `docs/SDD.md` if design changes |
| API route, schema, error, auth, rate limit | `docs/SRS.md`, `docs/SDD.md`, `docs/openapi.yaml`, setup usage/configuration pages |
| Component boundary, cache, renderer topology, protocol | `docs/SDD.md` and architecture/configuration pages |
| Engine, renderer version, format, option | SRS/SDD as applicable, `README.adoc`, diagram-types/features pages, `CHANGELOG.md` |
| Docker, Compose, Kubernetes, port, environment variable | `docs/SDD.md`, setup pages/examples, README, Docker Hub docs |
| VS Code Extension or GitHub Action | `docs/SRS.md`, `docs/SDD.md`, then user setup docs when delivered |
| Build, test, CI, release | README, SDD test/deployment sections, changelog when user-visible |
| Test strategy, environment, acceptance case or coverage | `docs/TestPlan.md`; SRS/SDD only if requirement or architecture changes |
| Vulnerability reporting or security policy | `SECURITY.md`; SRS/SDD for system security behavior |

## Local skills

Skills are stored under `.agents/skills/`. Read a matching `SKILL.md` completely before applying it.

| Task | Skill |
|---|---|
| End of code/config-changing work | [project-docs-maintenance](.agents/skills/project-docs-maintenance/SKILL.md) |
| Specification workflow | `speckit-specify`, `speckit-clarify`, `speckit-plan`, `speckit-tasks`, `speckit-analyze` |
| Implementing an approved task plan | `speckit-implement`, then `speckit-converge` if required |
| Turning tasks into GitHub issues | `speckit-taskstoissues` |
| Redesigning an existing frontend | `redesign-existing-projects` |

## Before finalizing a change

- Run tests proportionate to the modified service and contract.
- Check that no secrets, private diagram source, temporary logs, screenshots, or generated build output were added accidentally.
- Compare behavior with `docs/SRS.md` and architecture with `docs/SDD.md`.
- Invoke `project-docs-maintenance` and update only the documents made stale.
- Report unrun tests, implementation/SRS discrepancies, and remaining risks explicitly.
