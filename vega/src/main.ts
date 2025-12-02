import { convert as convertVega } from "./convert.js";
import { parseArgs } from "@std/parse-args";
import { stdin, stdout } from "node:process";
import pkg from "../deno.json" with { type: "json" };

const encoding = "utf-8";
let data: string;
let format = "svg";
let safeMode = "secure";
let specFormat = "default";

async function convert() {
  const source = data.toString();
  if (source === "") {
    return;
  }
  try {
    const result = await convertVega(source, {
      specFormat,
      safeMode,
      format,
    });
    if (result) {
      stdout.write(result);
    }
  } catch (err) {
    if (err instanceof Error && err.name) {
      if (err.name === "UnsafeIncludeError") {
        console.error(err.message);
        Deno.exit(13); // permission denied
      } else if (err.name === "IllegalArgumentError") {
        console.error(err.message);
        Deno.exit(22); // invalid argument
      }
    }
    console.error(err);
    Deno.exit(1);
  }
}

function main() {
  const argv = parseArgs(Deno.args);

  if (argv.version) {
    console.log(`vega ${pkg.imports["vega"].replace("npm:vega@", "")}`);
    Deno.exit(0);
  }
  if (argv["output-format"]) {
    format = argv["output-format"];
  }
  if (argv["safe-mode"]) {
    safeMode = argv["safe-mode"].toLowerCase();
  }
  if (argv["spec-format"]) {
    specFormat = argv["spec-format"].toLowerCase();
  }

  // Accepting piped content. E.g.:
  // echo "pass in this string as input" | ./example-script
  data = "";
  stdin.setEncoding(encoding);

  stdin.on("readable", function () {
    let chunk = stdin.read();
    while (chunk) {
      data += chunk;
      chunk = stdin.read();
    }
  });

  stdin.on("end", async function () {
    // There will be a trailing \n from the user hitting enter. Get rid of it.
    data = data.replace(/\n$/, "");
    await convert();
  });
}

/**
 * Run CLI.
 */

main();
