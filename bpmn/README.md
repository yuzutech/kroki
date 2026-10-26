# BPMN server

Version: 18.18.0 ([bpmn-js](https://github.com/bpmn-io/bpmn-js))

Renders BPMN 2.0 XML into SVG using a headless Chromium instance running the
[bpmn-js](https://github.com/bpmn-io/bpmn-js) viewer. See `src/worker.js` for
the conversion flow and `src/browser-instance.js` for the Chromium launch
flags (shared defaults live in `../lib/browser-instance`).

## Update

`assets/bpmn-viewer.production.min.js` is a pre-built bundle of bpmn-js loaded
by `assets/index.html` at conversion time. It is copied from `node_modules` by
the `prestart` script, which `npm start` runs first, and is not committed: the
Docker image generates it in a build stage.

To update the bpmn-js version:

1. Bump the `bpmn-js` version in `package.json`.
2. Run `npm install`, then `npm start` to check the conversion with the new
   bundle.
3. Commit the `package.json`/`package-lock.json` changes, update the version
   above and run `task updateVersions` from the root directory.
