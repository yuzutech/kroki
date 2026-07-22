# Code To UML platform

## Local startup

```powershell
Copy-Item .env.example .env
docker compose -f compose.code-to-uml.yml up -d --build
```

Open `http://localhost:8000`. PostgreSQL data is persisted in the `code-to-uml-postgres` Docker volume. The Kroki core and companion renderers have no host ports; all public traffic goes through the gateway.

For production, set a strong `POSTGRES_PASSWORD`, `PUBLIC_URL=https://your-domain`, and `COOKIE_SECURE=true`. Terminate TLS at a reverse proxy or load balancer. Do not expose PostgreSQL, the Kroki core, or companion ports publicly.

## Authentication

The web app uses an HttpOnly, SameSite cookie. API clients use either a personal API key or a device-flow access token:

```http
Authorization: Bearer ctu_...
```

API keys and session/access tokens are stored as SHA-256 hashes. Passwords are salted and hashed with scrypt. API keys are shown only once.

## GitHub Action

Create an API key in Account, save it as the repository secret `CODE_TO_UML_API_KEY`, then use:

```yaml
- uses: your-org/code-to-uml@main
  with:
    server-url: https://uml.example.com
    api-key: ${{ secrets.CODE_TO_UML_API_KEY }}
    engine: plantuml
    format: svg
    source: docs/architecture.puml
    output: docs/architecture.svg
```

### Pull request semantic diagram diff (localhost)

The included `.github/workflows/code-to-uml-pr-diff.yml` runs on a **self-hosted GitHub runner installed on the same machine as Docker**. It connects directly to `http://localhost:8000`; no public deployment, tunnel, server URL variable or API key is required.

Start Code To UML before leaving the runner online:

```powershell
docker compose -f compose.code-to-uml.yml up -d
Invoke-WebRequest http://localhost:8000/health -UseBasicParsing
```

Register a runner from **Repository Settings → Actions → Runners → New self-hosted runner**, follow GitHub's Windows commands, and install it as a Windows service if it must receive PR jobs while no terminal is open. The workflow rejects fork PRs because self-hosted runners must not execute untrusted code.

The Action compares the PR base SHA with its head SHA, generates `artifacts/diagram-pr-diff.svg`, uploads it as the `code-to-uml-pr-diff` workflow artifact and maintains one PR summary comment. The change map uses green for added nodes, amber for modified nodes and red for removed nodes. Mermaid, PlantUML/C4, Graphviz/DOT, D2 and DBML receive semantic node/edge comparison. Markdown fenced diagrams are compared independently; other renderer files use a clearly labelled file-level fallback.

## VS Code extension

```powershell
cd vscode-extension
npm install
npm run package
code --install-extension .\code-to-uml-0.6.1.vsix --force
```

Set `codeToUml.serverUrl` to a local or hosted service. Use **Code To UML: Open Live Preview** for render-on-change/render-on-save and **Code To UML: Export Diagram** for SVG, PNG or PDF. Authentication remains available for protected services.

Markdown files support multiple fenced diagrams. `Ctrl+Shift+V` renders supported fences in VS Code's built-in Markdown Preview. Export offers each named diagram separately and an **All diagrams** option that combines every valid diagram into one SVG while skipping and reporting invalid blocks.

## Operations

```powershell
docker compose -f compose.code-to-uml.yml ps
docker compose -f compose.code-to-uml.yml logs -f gateway
docker compose -f compose.code-to-uml.yml down
```

Do not use `down -v` unless you intentionally want to delete the PostgreSQL database.
