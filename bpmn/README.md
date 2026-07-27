# BPMN server

Version: 18.18.0 ([bpmn-js](https://github.com/bpmn-io/bpmn-js))

Renders BPMN 2.0 XML into SVG using a headless Chromium instance running the
[bpmn-js](https://github.com/bpmn-io/bpmn-js) viewer. See `src/worker.js` for
the conversion flow and `src/browser-instance.js` for the Chromium launch
flags (shared defaults live in `../lib/browser-instance`).

## Update

`assets/bpmn-viewer.production.min.js` is a pre-built bundle of bpmn-js that
is committed to the repository and loaded by `assets/index.html` at
conversion time — the Docker image runs `node src/index.js` directly, so the
bundle is not regenerated at build time.

To update the bpmn-js version:

1. Bump the `bpmn-js` version in `package.json`.
2. Run `npm install`.
3. Run `npm start` (or `npm run prestart`) to copy the freshly installed
   `node_modules/bpmn-js/dist/bpmn-viewer.production.min.js` over
   `assets/bpmn-viewer.production.min.js`.
4. Commit the regenerated `assets/bpmn-viewer.production.min.js` along with
   the `package.json`/`package-lock.json` changes, and update the version
   above.
