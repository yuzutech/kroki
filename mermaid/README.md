# Mermaid server

Version: 12.1.0 ([Mermaid](https://github.com/mermaid-js/mermaid))

Renders Mermaid diagrams into SVG or PNG using a headless Chromium instance
that loads `assets/index.html`. See `src/worker.js` for the conversion flow
and `src/browser-instance.js` for the Chromium launch flags (shared defaults
live in `../lib/browser-instance`).

Since Mermaid 12, the ELK layout engine is bundled with Mermaid and is the
default layout. The [tidy-tree](https://www.npmjs.com/package/@mermaid-js/layout-tidy-tree)
alternate layout engine is registered in `assets/index.html`.

## Update Mermaid

The files in `assets/mermaid/` are copied from `node_modules` and committed to
the repository — the Docker image runs `node src/index.js` directly and only
installs production dependencies, so they are not regenerated at build time.

To update the Mermaid version:

1. Bump the `mermaid` (and, if needed, `@mermaid-js/layout-tidy-tree`) version
   in `package.json`.
2. Run `npm install`.
3. Run `npm start` (or `npm run prestart`) to replace the content of
   `assets/mermaid/` with the freshly installed bundles and their chunks.
4. Run `npm test` and `npm run lint`.
5. Commit the regenerated `assets/mermaid/` directory (including the added
   and deleted chunk files) along with the `package.json`/`package-lock.json`
   changes. Update the version above, `mermaid-version` in
   `../docs/antora.yml` and the version returned by
   `../server/src/main/java/io/kroki/server/service/Mermaid.java`.

## Update the icons

`assets/icons.json` is the [Iconify](https://iconify.design/) `logos` icon
pack, registered in `assets/index.html` so diagrams can use icons such as
`logos:aws` (e.g., in architecture diagrams). It is downloaded from
[`@iconify-json/logos`](https://www.npmjs.com/package/@iconify-json/logos):

```
https://unpkg.com/@iconify-json/logos@1.2.15/icons.json
```

To update it, run:

```console
npm run update-icons             # latest version
npm run update-icons -- 1.2.15   # specific version
```

Then commit `assets/icons.json` and update the version in the URL above.
