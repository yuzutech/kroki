import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

import type { OutputFormat } from "@diagram-as-code/contracts";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const BLOCKED_ELEMENTS = new Set([
  "script",
  "foreignobject",
  "iframe",
  "object",
  "embed",
  "animate",
  "animatetransform",
  "set",
]);

export class InvalidRenderOutput extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRenderOutput";
  }
}

export class RenderOutputTooLarge extends Error {
  constructor(readonly actualBytes: number, readonly maximumBytes: number) {
    super(`Renderer output is ${actualBytes} bytes; maximum is ${maximumBytes} bytes`);
    this.name = "RenderOutputTooLarge";
  }
}

function assertSize(body: Buffer, maximumBytes: number): void {
  if (body.byteLength > maximumBytes) throw new RenderOutputTooLarge(body.byteLength, maximumBytes);
}

function isSafeReference(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "" || normalized.startsWith("#") || /^data:image\/(?:png|jpeg|gif|webp);base64,/.test(normalized);
}

function hasUnsafeCss(value: string): boolean {
  if (/(?:expression\s*\(|@import|javascript\s*:)/i.test(value)) return true;
  for (const match of value.matchAll(/url\s*\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    if (!isSafeReference(match[2] ?? "")) return true;
  }
  return false;
}

function sanitizeElement(element: Element): void {
  for (let index = element.attributes.length - 1; index >= 0; index -= 1) {
    const attribute = element.attributes.item(index);
    if (!attribute) continue;
    const name = attribute.name.toLowerCase();
    const value = attribute.value;
    const unsafeReference = (name === "href" || name === "xlink:href" || name === "src") && !isSafeReference(value);
    if (name.startsWith("on") || /^\s*javascript:/i.test(value) || hasUnsafeCss(value) || unsafeReference) {
      element.removeAttributeNode(attribute);
    }
  }

  for (let child = element.firstChild; child;) {
    const next = child.nextSibling;
    if (child.nodeType === 1) {
      const childElement = child as Element;
      if (BLOCKED_ELEMENTS.has(childElement.tagName.toLowerCase())) {
        element.removeChild(childElement);
      } else {
        sanitizeElement(childElement);
      }
    } else if (child.nodeType === 3 && element.tagName.toLowerCase() === "style" && hasUnsafeCss(child.nodeValue ?? "")) {
      element.removeChild(child);
    }
    child = next;
  }
}

export function sanitizeSvg(body: Buffer): Buffer {
  const source = body.toString("utf8");
  if (/<!ENTITY/i.test(source)) throw new InvalidRenderOutput("SVG entity declarations are not allowed");
  const sourceWithoutDoctype = source.replace(/<!DOCTYPE[^>]*>/gi, "");
  const parseErrors: string[] = [];
  const document = new DOMParser({
    errorHandler: {
      warning: () => undefined,
      error: (message) => parseErrors.push(message),
      fatalError: (message) => parseErrors.push(message),
    },
  }).parseFromString(sourceWithoutDoctype, "image/svg+xml");
  const root = document.documentElement;
  if (parseErrors.length > 0 || !root || root.tagName.toLowerCase() !== "svg") {
    throw new InvalidRenderOutput("Renderer did not return a well-formed SVG document");
  }
  sanitizeElement(root);
  return Buffer.from(new XMLSerializer().serializeToString(document), "utf8");
}

export function validateRenderOutput(body: Buffer, format: OutputFormat, maximumBytes: number): Buffer {
  assertSize(body, maximumBytes);
  if (format === "png") {
    if (body.byteLength < PNG_SIGNATURE.length || !body.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
      throw new InvalidRenderOutput("Renderer did not return a valid PNG signature");
    }
    return body;
  }
  const sanitized = sanitizeSvg(body);
  assertSize(sanitized, maximumBytes);
  return sanitized;
}
