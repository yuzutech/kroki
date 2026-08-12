"use strict";

import { describe, it } from "node:test";

import { convert } from "../src/convert.js";
import sinon from "sinon";
import ospath from "node:path";
import { deepEqual, fail } from "node:assert";

const __dirname = import.meta.dirname;

describe("#convert", function () {
  it("should throw UnsafeIncludeError in secure mode when the Vega-Lite specification contains data[].url", async function () {
    const input = `{
  "data": {"url": "data/cars.json"},
  "mark": "point",
  "encoding": {
    "x": {"field": "Horsepower", "type": "quantitative"},
    "y": {"field": "Miles_per_Gallon", "type": "quantitative"}
  }
}`;
    try {
      await convert(input, {
        specFormat: "lite",
        safeMode: "secure",
        format: "svg",
      });
      fail(
        "It should throw an error in secure mode when the Vega-Lite specification contains data.url",
      );
    } catch (err) {
      deepEqual(err.name, "UnsafeIncludeError");
    }
  });
  it("should throw UnsafeIncludeError in secure mode when the Vega specification contains data.url", async () => {
    const input = `{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 500,
  "height": 200,
  "data": {
    "name": "passwd",
    "url": "file:///etc/passwd",
    "format": {
      "type": "dsv",
      "delimiter": ":",
      "header": [
        "username",
        "password",
        "uid",
        "gid",
        "comment",
        "home",
        "shell"
      ]
    }
  },
  "marks": [
    {
      "type": "text",
      "from": {
        "data": "passwd"
      },
      "encode": {
        "enter": {
          "text": {
            "signal": "datum.username + ':' + datum.password + ':' + datum.uid + ':' + datum.gid + ':' + datum.comment + ':' + datum.home + ':' + datum.shell"
          }
        }
      }
    }
  ],
  "scales": [
    {
      "name": "yscale",
      "type": "linear",
      "domain": {
        "data": "passwd",
        "field": "index"
      },
      "range": [
        0,
        1000
      ]
    }
  ]
}`;
    try {
      await convert(input, {
        specFormat: "",
        safeMode: "secure",
        format: "svg",
      });
      fail(
        "",
        "",
        "It should throw an error in secure mode when the Vega-Lite specification contains data.url",
      );
    } catch (err) {
      deepEqual(err.name, "UnsafeIncludeError");
    }
  });
  it("should throw UnsafeIncludeError in secure mode when the Vega specification contains marks[].data[].url", async function () {
    const input = `{
  "marks": [
    {
      "type": "group",
      "data": [
        {
          "url": "data/cars.json"
        }
      ]
    }
  ]
}`;
    try {
      await convert(input, {
        specFormat: "",
        safeMode: "secure",
        format: "svg",
      });
      fail(
        "",
        "",
        "It should throw an error in secure mode when the Vega-Lite specification contains data.url",
      );
    } catch (err) {
      deepEqual(err.name, "UnsafeIncludeError");
    }
  });
  it("should throw UnsafeIncludeError in secure mode when the Vega specification contains marks[].marks[].data[].url (nested group marks)", async function () {
    const input = `{
  "marks": [
    {
      "type": "group",
      "marks": [
        {
          "type": "group",
          "data": [
            {
              "url": "data/cars.json"
            }
          ]
        }
      ]
    }
  ]
}`;
    try {
      await convert(input, {
        specFormat: "",
        safeMode: "secure",
        format: "svg",
      });
      fail(
        "",
        "",
        "It should throw an error in secure mode when the Vega specification contains marks[].marks[].data[].url",
      );
    } catch (err) {
      deepEqual(err.name, "UnsafeIncludeError");
    }
  });
  it("should throw UnsafeIncludeError in secure mode when the Vega specification contains an image mark with encode.*.url", async function () {
    const input = `{
  "marks": [
    {
      "type": "image",
      "encode": {
        "enter": {
          "url": { "value": "http://169.254.169.254/latest/meta-data/" },
          "x": { "value": 0 },
          "y": { "value": 0 },
          "width": { "value": 100 },
          "height": { "value": 100 }
        }
      }
    }
  ]
}`;
    try {
      await convert(input, {
        specFormat: "",
        safeMode: "secure",
        format: "svg",
      });
      fail(
        "",
        "",
        "It should throw an error in secure mode when the Vega specification contains an image mark with encode.*.url",
      );
    } catch (err) {
      deepEqual(err.name, "UnsafeIncludeError");
    }
  });
  it("should throw UnsafeIncludeError for deeply nested mark data URLs", async function () {
    const input = `{
  "marks": [
    {
      "type": "group",
      "marks": [
        {
          "type": "group",
          "marks": [
            {
              "type": "group",
              "marks": [
                {
                  "type": "text",
                  "data": {
                    "url": "file:///etc/passwd"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}`;
    try {
      await convert(input, {
        specFormat: "",
        safeMode: "secure",
        format: "svg",
      });
      fail("Deeply nested mark data URLs should be rejected in secure mode");
    } catch (err) {
      deepEqual(err.name, "UnsafeIncludeError");
    }
  });
  it("should throw UnsafeIncludeError for nested image encode signal URLs", async function () {
    const input = `{
  "marks": [
    {
      "type": "group",
      "marks": [
        {
          "type": "group",
          "marks": [
            {
              "type": "image",
              "encode": {
                "update": {
                  "url": {
                    "signal": "'http://169.254.169.254/latest/meta-data/'"
                  },
                  "x": {"value": 0},
                  "y": {"value": 0},
                  "width": {"value": 100},
                  "height": {"value": 100}
                }
              }
            }
          ]
        }
      ]
    }
  ]
}`;
    try {
      await convert(input, {
        specFormat: "",
        safeMode: "secure",
        format: "svg",
      });
      fail("Nested image encode URLs should be rejected in secure mode");
    } catch (err) {
      deepEqual(err.name, "UnsafeIncludeError");
    }
  });
  it("should allow inline values in secure mode", async function () {
    const input = `{
  "width": 100,
  "height": 100,
  "data": {
    "values": [
      {"x": 10, "y": 10}
    ]
  },
  "marks": [
    {
      "type": "rect",
      "encode": {
        "enter": {
          "x": {"field": "x"},
          "y": {"field": "y"},
          "width": {"value": 20},
          "height": {"value": 20}
        }
      }
    }
  ]
}`;
    const result = await convert(input, {
      specFormat: "",
      safeMode: "secure",
      format: "svg",
    });
    deepEqual(result.includes("<svg"), true);
  });
  it("should throw IllegalArgumentError when output format is not supported", async function () {
    const input = `{
  "data": {
    "values": "a\\n1\\n2\\n3\\n4",
    "format": {
      "type": "csv"
    }
  },
  "mark": "point",
  "encoding": {
    "y": {"field": "a", "type": "quantitative"}
  }
}`;
    try {
      await convert(input, {
        specFormat: "lite",
        safeMode: "safe",
        format: "txt",
      });
      fail("It should throw an error when output format is not supported");
    } catch (err) {
      deepEqual(err.name, "IllegalArgumentError");
    }
  });
  it("should not output warning to stdout", async function () {
    sinon.stub(process.stdout, "write");
    sinon.stub(process.stderr, "write");
    try {
      const input = `{
  "mark": "rect",
  "encoding": {
    "x": {"value": 1},
    "text": {"value":"foo"}
  }
}`;
      const result = await convert(input, {
        specFormat: "lite",
        safeMode: "safe",
        format: "svg",
      });
      deepEqual(
        result.includes('<svg xmlns="http://www.w3.org/2000/svg"'),
        true,
        "generated SVG must include <svg> start tag",
      );
      deepEqual(
        result.includes("</svg>"),
        true,
        "generated SVG must include <svg> end tag",
      );
      const stdoutWriteCalls = process.stdout.write.getCalls();
      const stderrWriteCalls = process.stderr.write.getCalls();
      deepEqual(
        stdoutWriteCalls.length === 0,
        true,
        `It should not output warning messages to stdout but process.stdout.write('${
          stdoutWriteCalls && stdoutWriteCalls[0] &&
          stdoutWriteCalls[0].args.join(" ")
        }') was called`,
      );
      deepEqual(
        stderrWriteCalls.length === 0,
        true,
        `It should not output warning messages to stderr but process.stderr.write('${
          stderrWriteCalls && stderrWriteCalls[0] &&
          stderrWriteCalls[0].args.join(" ")
        }') was called`,
      );
    } finally {
      process.stdout.write.restore();
      process.stderr.write.restore();
    }
  });
  it("should convert a Vega-Lite definition to PNG", async function () {
    const decoder = new TextDecoder("utf-8");
    const input = await Deno.readFile(
      ospath.join(__dirname, "fixtures", "diag.vlite"),
    );
    const pngBuffer = await convert(decoder.decode(input), {
      specFormat: "lite",
      safeMode: "safe",
      format: "png",
    });
    deepEqual(
      Buffer.byteLength(pngBuffer) > 10000,
      true,
      "generated PNG image must be greater than 20000 bytes",
    );
  });
  it("should convert a Vega-Lite definition to PDF", async function () {
    const decoder = new TextDecoder("utf-8");
    const input = await Deno.readFile(
      ospath.join(__dirname, "fixtures", "diag.vlite"),
    );
    const pdfBuffer = await convert(decoder.decode(input), {
      specFormat: "lite",
      safeMode: "safe",
      format: "pdf",
    });
    deepEqual(
      Buffer.byteLength(pdfBuffer) > 10000,
      true,
      "generated PDF file must be greater than 10000 bytes",
    );
    // REMIND: unable to strictly compare the PDF because it contains metadata! (more specifically the creation date!)
  });
  it("should convert a Vega-Lite definition to SVG", async function () {
    const decoder = new TextDecoder("utf-8");
    const input = await Deno.readFile(
      ospath.join(__dirname, "fixtures", "diag.vlite"),
    );
    const svg = await convert(decoder.decode(input), {
      specFormat: "lite",
      safeMode: "safe",
      format: "svg",
    });
    deepEqual(
      svg.length > 20000,
      true,
      "generated SVG image must be greater than 20000 bytes",
    );
  });
});
