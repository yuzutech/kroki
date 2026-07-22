# Diagram as Code Check

This JavaScript Action verifies that committed diagram files match their sources. It checks changed files on normal pull requests and all sources when `.diagram.yml` or `.diagram-renderer.lock` changes.

```yaml
- uses: hnamkk/MyKroki/product/github-action@main
  with:
    gateway-url: ${{ vars.DIAGRAM_GATEWAY_URL }}
    api-key: ${{ secrets.DIAGRAM_API_KEY }}
```

Use a self-hosted runner when the Gateway is only reachable on the private network. Checkout must use `fetch-depth: 0` so changed-file detection can compare against the pull request base branch.

The Action never commits files and never posts comments. A failed check lists stale, missing, or orphaned SVGs in the job summary and links to the pull request file diff when available.
