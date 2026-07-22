import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as {
  activationEvents: string[];
  contributes: {
    commands: Array<{ command: string; icon?: string }>;
    menus: Record<string, Array<{ command: string; group?: string; when?: string }>>;
  };
};

function menuCommands(menu: string): string[] {
  return (manifest.contributes.menus[menu] ?? []).map((item) => item.command);
}

test("exposes prioritized editor and preview title buttons", () => {
  const editorItems = manifest.contributes.menus["editor/title"] ?? [];
  assert.deepEqual(menuCommands("editor/title"), [
    "diagramAsCode.preview",
    "diagramAsCode.exportSvg",
  ]);
  assert.deepEqual(editorItems.map((item) => item.group), ["navigation@1", "navigation@2"]);
  assert.deepEqual(menuCommands("webview/title"), [
    "diagramAsCode.refreshPreview",
    "diagramAsCode.exportPreviewSvg",
  ]);

  const commands = new Map(manifest.contributes.commands.map((item) => [item.command, item]));
  assert.equal(commands.get("diagramAsCode.refreshPreview")?.icon, "$(refresh)");
  assert.equal(commands.get("diagramAsCode.exportPreviewSvg")?.icon, "$(export)");
});

test("exposes diagram commands from editor and Explorer context menus", () => {
  const expected = [
    "diagramAsCode.preview",
    "diagramAsCode.exportSvg",
    "diagramAsCode.setApiKey",
  ];
  assert.deepEqual(menuCommands("editor/context"), expected);
  assert.deepEqual(menuCommands("explorer/context"), expected);
});

test("activates when a supported diagram language is opened", () => {
  assert.deepEqual(
    manifest.activationEvents.filter((event) => event.startsWith("onLanguage:")),
    [
      "onLanguage:diagram-mermaid",
      "onLanguage:diagram-plantuml",
      "onLanguage:diagram-plantuml-long",
      "onLanguage:diagram-dot",
      "onLanguage:diagram-d2",
    ],
  );
});
