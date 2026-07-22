# Diagram as Code for VS Code

The extension previews `.mmd`, `.puml`, `.plantuml`, `.dot`, and `.d2` files through a configured Diagram as Code Gateway and exports one canonical SVG per source.

## Commands

- `Diagram: Open Preview` opens a live preview beside the editor.
- `Diagram: Export SVG` writes the stable output path from `.diagram.yml`.
- `Diagram: Set Gateway API Key` stores the key in VS Code SecretStorage.

Preview waits for the configured debounce interval, cancels superseded requests, and reuses a matching render when exporting. Saving does not download or create an SVG; export remains an explicit command.

When a supported diagram file is active, labeled `Preview` and `Export` buttons appear in the VS Code status bar. Icon buttons also appear in the diagram editor title, while an active preview has refresh and export buttons in its title bar. The same commands are available by right-clicking supported files in the editor or Explorer.

## Project configuration

Add `.diagram.yml` at the workspace root. See `product/.diagram.example.yml` in the repository. Configure `diagramAsCode.gatewayUrl` in VS Code. The API key comes from `DIAGRAM_API_KEY` or VS Code SecretStorage and is never stored in the project file.
