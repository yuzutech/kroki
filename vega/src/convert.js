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
  if (safeMode === "secure" && spec) {
    if (spec.data && Array.isArray(spec.data)) {
      const dataWithUrlAttribute = spec.data.filter((item) => item.url);
      if (dataWithUrlAttribute && dataWithUrlAttribute.length > 0) {
        throw new UnsafeIncludeError(
          `Unable to load data from an URL while running in secure mode.
Please include your data set as 'values' or run Kroki in unsafe mode using the KROKI_SAFE_MODE environment variable.`,
        );
      }
    }
    if (spec.data && typeof spec.data === "object" && spec.data.url) {
      throw new UnsafeIncludeError(
        `Unable to load data from an URL while running in secure mode.
Please include your data set as 'values' or run Kroki in unsafe mode using the KROKI_SAFE_MODE environment variable.`,
      );
    }
    if (spec.marks && Array.isArray(spec.marks)) {
      const dataWithUrlAttribute = spec.marks.flatMap((m) => m.data).filter((
        item,
      ) => item && item.url);
      if (dataWithUrlAttribute && dataWithUrlAttribute.length > 0) {
        throw new UnsafeIncludeError(
          `Unable to load data from an URL while running in secure mode.
Please include your data set as 'values' or run Kroki in unsafe mode using the KROKI_SAFE_MODE environment variable.`,
        );
      }
    }
  }
  const view = new View(parse(spec), {
    renderer: format === "svg" ? "svg" : "canvas",
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
