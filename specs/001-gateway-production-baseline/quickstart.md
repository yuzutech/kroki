# Quickstart: Verify Gateway Production Baseline

```powershell
npm ci --prefix product
npm run typecheck --prefix product
npm test --prefix product
npm run build --prefix product
```

For real renderer verification, start `product/deploy/docker-compose.yml` with an API key and run:

```powershell
$env:DIAGRAM_API_KEY='the-configured-key'
npm run smoke --prefix product
```

Acceptance additionally requires focused tests for revoked/missing scopes, cache partitioning, bulkhead overflow, unsafe SVG, invalid PNG, oversized output, redacted events and unsafe production no-auth configuration.
