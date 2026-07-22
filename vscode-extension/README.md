# Code To UML for VS Code

The extension is intentionally focused on diagram rendering:

- A Code To UML icon in the Activity Bar opens a compact launcher for Live Preview, Export, API key and Settings.
- **Code To UML: Open Live Preview** renders the active diagram beside the editor and refreshes while typing.
- Render-on-save refreshes the open preview immediately after save.
- **Code To UML: Export Diagram** exports one selected diagram as SVG/PNG/PDF. In multi-diagram Markdown, **All diagrams** combines valid blocks into one SVG image, skips invalid blocks and reports their names.
- Markdown files can contain multiple fenced diagram blocks. Live Preview renders every block with its title; exporting lets you choose one block.
- VS Code's built-in Markdown Preview (`Ctrl+Shift+V`) renders the same diagram fences through the configured Code To UML service.
- `codeToUml.serverUrl` can point to `http://localhost:8000` or a hosted compatible service.

The engine is detected from file extension, VS Code language ID, and source syntax. Every renderer registered by this Code To UML server is recognized; unknown files use `codeToUml.defaultEngine` only when preview is opened manually.

In Markdown, put a heading immediately before a diagram or add a fence title such as `````plantuml title="Service classes"``. That title appears above the preview.

Use **Code To UML: Set API Key** only when a hosted service requires authentication. The key is stored in VS Code SecretStorage. Local rendering works without login.
After a key is validated, the Activity Bar sidebar shows **Hello, &lt;display name&gt;** and the account email returned by `/api/auth/me`.
Only the newest key for an account remains active. The extension revalidates its key every three seconds and automatically clears a revoked key.
