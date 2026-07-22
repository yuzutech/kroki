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

VS Code browser login flow:

1. Extension calls `POST /api/auth/device/start`.
2. It opens the returned `verification_uri_complete` in the browser.
3. The signed-in user approves the code.
4. Extension polls `POST /api/auth/device/token`.
5. The resulting token is stored using VS Code SecretStorage.

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

## VS Code extension

```powershell
cd vscode-extension
npm install
npm run package
code --install-extension .\code-to-uml-0.1.0.vsix
```

Set `codeToUml.serverUrl`, then run **Code To UML: Sign in with Browser** or **Code To UML: Set API Key** from the Command Palette.

## Operations

```powershell
docker compose -f compose.code-to-uml.yml ps
docker compose -f compose.code-to-uml.yml logs -f gateway
docker compose -f compose.code-to-uml.yml down
```

Do not use `down -v` unless you intentionally want to delete the PostgreSQL database.
