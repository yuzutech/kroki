---
name: project-docs-maintenance
description: Keep MyKroki project documentation aligned after changes to source code, tests, APIs, renderer behavior, companion services, Docker/CI configuration, VS Code Extension, GitHub Action, security, or other user-facing behavior. Use at the end of any code-changing or code-adjacent configuration session to review docs/SRS.md, docs/SDD.md, docs/openapi.yaml, docs/TestPlan.md, README.adoc, Antora pages, CHANGELOG.md, SECURITY.md, and Docker image documentation as applicable.
---

# Project Documentation Maintenance

Review documentation before completing any session that changes code, tests, API contracts, renderer behavior, infrastructure, CI, environment configuration, security, VS Code Extension, GitHub Action, or user-visible behavior.

## Documentation hierarchy

Treat each document according to its role:

| Document | Role | Update rule |
|---|---|---|
| `docs/SRS.md` | Approved product and software requirements | Update only when the user or project authority approves a requirement, scope, priority, constraint, NFR, or use-case change. Never rewrite the SRS merely to make non-conforming code look correct. |
| `docs/SDD.md` | Target architecture and accepted design decisions | Update when component boundaries, protocols, API/data contracts, cache/auth/rate-limit design, renderer topology, deployment model, or ADR decisions change. |
| `docs/openapi.yaml` | Machine-readable public Gateway API contract | Update whenever a route, parameter, request/response schema, media type, status/error code, example, or security requirement changes. Keep it aligned with SRS and SDD. |
| `docs/TestPlan.md` | Test strategy and acceptance baseline | Update when module behavior, supported engine/format, test environment, risk, acceptance case, priority, or requirement traceability changes. Do not mark planned modules as tested before implementation exists. |
| `docs/ImplementationPlan.md` | Phased delivery roadmap | Update when an approved phase, dependency, deliverable, exit criterion, implementation order, or completion status changes. Do not use it to override SRS priorities. |
| `README.adoc` | Repository overview, quickstart, usage, layout, build and run instructions | Update when delivered repository behavior or commands change. Do not describe planned components as implemented. |
| `docs/modules/ROOT/pages/*.adoc` | Public product and architecture documentation | Update delivered features, supported diagram types, architecture, landing-page information, and project help as applicable. |
| `docs/modules/setup/pages/*.adoc` | Public installation, configuration and usage documentation | Update environment variables, API usage, diagram options, Docker/Podman, Kubernetes, CLI, encoding, and HTTP-client behavior as applicable. |
| `docs/modules/setup/examples/` | Runnable deployment and encoding examples | Update when referenced commands, service names, ports, images, or configuration change. |
| `CHANGELOG.md` | User-visible release history | Add an `Unreleased` entry for a delivered, user-visible change according to the existing changelog convention. |
| `SECURITY.md` | Vulnerability reporting and security policy | Update only when reporting channels, supported policy, or disclosure process changes. |
| `DOCKERHUB.md`, `DOCKERHUB-COMPANION.md` | Container image descriptions | Update when image names, startup instructions, ports, companion relationships, or supported behavior change. |

`docs/SRS.md` and `docs/SDD.md` may describe an approved target that is only partially implemented. Preserve that distinction. Public usage documentation must describe what users can run now.

## Workflow

1. Inspect the changed files and diff.
2. Classify each change using the review map below.
3. Read the relevant documentation before editing it.
4. Compare implementation behavior with the SRS and SDD.
5. If code conflicts with an approved requirement or ADR, do not silently edit the baseline. Fix the code when in scope, or report the discrepancy and request an explicit product/design decision.
6. Update only documents made stale by the change.
7. Remove or correct obsolete claims instead of appending contradictory notes.
8. Verify every referenced path, endpoint, environment variable, engine, format, port, image, and command against the repository.
9. Report which documents were checked and updated. If no update is needed, state why.

## Review map

| Change area | Required documents to check | Additional documents |
|---|---|---|
| Product scope, user class, priority, use case or NFR | `docs/SRS.md` | `docs/SDD.md` if architecture is affected |
| Gateway route, request/response schema or error contract | `docs/SRS.md`, `docs/SDD.md`, `docs/openapi.yaml` | `README.adoc`, `docs/modules/setup/pages/usage.adoc`, `docs/modules/setup/pages/http-clients.adoc` |
| Authentication, API key, OIDC, authorization or rate limit | `docs/SRS.md`, `docs/SDD.md`, `docs/openapi.yaml` | Setup/configuration pages, `SECURITY.md` when policy changes |
| Cache, routing, component boundary or data flow | `docs/SDD.md` | Architecture page and configuration docs |
| Kroki fork, engine registry or output format | `docs/SRS.md`, `docs/SDD.md` | `README.adoc`, `docs/modules/ROOT/pages/diagram-types.adoc`, `docs/modules/ROOT/pages/features.adoc` |
| Renderer/companion implementation or version | `docs/SDD.md` | `README.adoc`, diagram-types/features pages, Docker image docs, `CHANGELOG.md` |
| VS Code Extension behavior or settings | `docs/SRS.md`, `docs/SDD.md` | User setup/usage docs once the extension is delivered |
| GitHub Action behavior, permissions or workflow contract | `docs/SRS.md`, `docs/SDD.md` | User setup/usage docs and `CHANGELOG.md` once delivered |
| `.diagram.yml` or another shared schema | `docs/SRS.md`, `docs/SDD.md` | README/setup docs and examples |
| Docker image, Compose, Kubernetes, port or environment variable | `docs/SDD.md` | `README.adoc`, setup pages/examples, `DOCKERHUB*.md` |
| CI, build or test command | `README.adoc` | `docs/SDD.md` test/deployment sections when design changes |
| Test strategy, environment, acceptance case or coverage | `docs/TestPlan.md` | `docs/SRS.md` or `docs/SDD.md` only when requirements or architecture change |
| Security hardening or vulnerability process | `docs/SRS.md`, `docs/SDD.md` | `SECURITY.md`, configuration docs, `CHANGELOG.md` |
| User-visible bug fix or release behavior | Relevant baseline/design docs if semantics changed | `CHANGELOG.md` and affected public docs |

## Documentation standards

- Write `docs/SRS.md` and `docs/SDD.md` in Vietnamese with proper diacritics.
- Preserve the language and AsciiDoc conventions of existing public Kroki documentation unless the user requests translation.
- Keep requirement IDs, ADR IDs, endpoint names, schemas, and terminology stable unless the underlying contract intentionally changes.
- Keep Mermaid and JSON code blocks directly renderable/parseable.
- Prefer stable behavior and design facts over session narratives.
- Do not mention the assistant, temporary debugging steps, or speculative implementation details.
- Do not create a `docs/project/` tree; this repository's project baselines are `docs/SRS.md` and `docs/SDD.md`.
- Do not add credentials, private URLs, diagram source from private repositories, or secrets to documentation.
- Do not update generated SVGs or attachments unless their source or documented behavior changed.

## Completion checklist

- Changed behavior was compared with `docs/SRS.md` and `docs/SDD.md`.
- Public API changes were checked against `docs/openapi.yaml`.
- Test coverage and acceptance cases were checked against `docs/TestPlan.md` when behavior or test infrastructure changed.
- Approved requirements and ADRs were not silently changed to match implementation drift.
- Relevant README, Antora, changelog, security, image, and example documents were reviewed.
- Links and paths resolve to files that exist in this repository.
- API examples and configuration names match the implementation.
- Mermaid/JSON examples remain syntactically valid when edited.
- The final response identifies documentation updates or explains why none were required.
