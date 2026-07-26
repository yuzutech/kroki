# Project conventions

- Update `CHANGELOG.md` whenever you make a user-facing change: add an entry under `## [Unreleased]`, in the appropriate Keep a Changelog category (Added/Changed/Fixed/Security/Diagram libraries/...), following the existing entry style (short description + PR link).
- Internal-only dependency bumps (build tooling, test libraries, CI actions, low-level Java libs like netty/vertx/opentelemetry) are not changelog-worthy on their own — only note dependency updates that are user-visible (diagram library versions, base Docker image versions) or security-relevant.
- Run the linter (`npm run lint` in `mermaid/`, i.e. `biome check src`) whenever you make changes under `mermaid/`.