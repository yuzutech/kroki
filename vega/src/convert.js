import { parse, View } from "vega";
import { compile } from "vega-lite";

class UnsafeIncludeError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnsafeIncludeError";
  }
}

class IllegalArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = "IllegalArgumentError";
  }
}

/**
 * Suppress non-critical messages (i.e., warning, info and debug messages) to prevent writing on stderr or stdout.
 */
const nullLogger = {
  warn: (_) => {},
  info: (_) => {},
  debug: (_) => {},
};

/**
 * Rejects every resource request, whatever its origin in the specification
 * (data sets, image marks, computed URLs...). Used unless Kroki is running in
 * unsafe mode, in addition to the check made by `specHasUnsafeUrl`, which only
 * looks at known locations but returns an explicit error.
 */
const rejectResource = () =>
  Promise.reject(new Error("Kroki does not load external resources."));
const denyAllLoader = { load: rejectResource, sanitize: rejectResource };

/**
 * Whether a `data` definition (either a single object, as found on
 * `spec.data` or `mark.encode.*`, or an array of them, as found on
 * `spec.data` or `mark.data`) includes a `url` attribute.
 * @param data
 * @returns {boolean}
 */
function dataHasUrl(data) {
  if (!data) {
    return false;
  }
  if (Array.isArray(data)) {
    return data.some((item) => item && item.url);
  }
  return typeof data === "object" && !!data.url;
}

/**
 * Whether a mark's `encode` block sets a `url` on any of its property
 * sets (e.g. `enter`, `update`, `exit`, `hover`). Image marks load this
 * URL directly through the renderer, independently of `data`.
 * @param encode
 * @returns {boolean}
 */
function encodeHasUrl(encode) {
  if (!encode || typeof encode !== "object") {
    return false;
  }
  return Object.values(encode).some((entry) => dataHasUrl(entry));
}

/**
 * Whether any mark in the given array (including those nested inside
 * group marks, since Vega allows group marks to be nested arbitrarily
 * deep) references a URL, either through its `data` or through an
 * image mark's `encode.*.url`.
 * @param marks
 * @returns {boolean}
 */
function marksHaveUnsafeUrl(marks) {
  return marks.some((mark) => {
    if (!mark) {
      return false;
    }
    if (dataHasUrl(mark.data) || encodeHasUrl(mark.encode)) {
      return true;
    }
    return Array.isArray(mark.marks) && marksHaveUnsafeUrl(mark.marks);
  });
}

/**
 * Whether a parsed Vega/Vega-Lite spec references a URL anywhere secure
 * mode must block: top-level `data`, or `data`/`encode.*.url` on any
 * mark, however deeply nested.
 * @param spec
 * @returns {boolean}
 */
function specHasUnsafeUrl(spec) {
  if (!spec) {
    return false;
  }
  if (dataHasUrl(spec.data)) {
    return true;
  }
  return Array.isArray(spec.marks) && marksHaveUnsafeUrl(spec.marks);
}

/**
 * @param source
 * @param options
 * @returns {Promise<string|Buffer>}
 */
export async function convert(source, options) {
  const { safeMode, specFormat, format } = options;
  let spec = JSON.parse(source);
  if (specFormat === "lite") {
    spec = compile(spec, { logger: nullLogger }).spec;
  }
  if (safeMode === "secure" && specHasUnsafeUrl(spec)) {
    throw new UnsafeIncludeError(
      `Unable to load data from an URL: Kroki does not load external resources in Vega and Vega-Lite diagrams.
Please include your data set as 'values'.`,
    );
  }
  const view = new View(parse(spec), {
    renderer: format === "svg" ? "svg" : "canvas",
    ...(safeMode === "unsafe" ? {} : { loader: denyAllLoader }),
  }).finalize();
  if (format === "svg") {
    return await view.toSVG();
  }
  if (format === "png") {
    const canvas = await view.toCanvas();
    const data = [];
    return new Promise((resolve, reject) => {
      const stream = canvas.createPNGStream();
      stream.on("data", (chunk) => data.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(data)));
      stream.on("error", (error) => reject(error));
    });
  }
  if (format === "pdf") {
    const canvas = await view.toCanvas(undefined, {
      type: "pdf",
      context: { textDrawingMode: "glyph" },
    });
    const data = [];
    return new Promise((resolve, reject) => {
      const stream = canvas.createPDFStream();
      stream.on("data", (chunk) => data.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(data)));
      stream.on("error", (error) => reject(error));
    });
  }
  throw new IllegalArgumentError(
    `Unknown output format: ${format}. Must be one of: svg, png or pdf.`,
  );
}
