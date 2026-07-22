const vscode = require('vscode')

const TOKEN_KEY = 'codeToUml.token'
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const serverUrl = () => vscode.workspace.getConfiguration('codeToUml').get('serverUrl').replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(serverUrl() + path, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(data.error || `HTTP ${response.status}`), { status: response.status })
  return data
}

async function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('codeToUml.login', async () => {
    try {
      const device = await request('/api/auth/device/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      await vscode.env.openExternal(vscode.Uri.parse(device.verification_uri_complete))
      vscode.window.showInformationMessage(`Approve device code ${device.user_code} in your browser.`)
      const deadline = Date.now() + device.expires_in * 1000
      while (Date.now() < deadline) {
        await sleep(device.interval * 1000)
        try {
          const token = await request('/api/auth/device/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device_code: device.device_code }) })
          await context.secrets.store(TOKEN_KEY, token.access_token)
          return vscode.window.showInformationMessage('Signed in to Code To UML.')
        } catch (error) { if (error.status !== 428) throw error }
      }
      throw new Error('The login request expired.')
    } catch (error) { vscode.window.showErrorMessage(`Code To UML login failed: ${error.message}`) }
  }))

  context.subscriptions.push(vscode.commands.registerCommand('codeToUml.apiKey', async () => {
    const key = await vscode.window.showInputBox({ prompt: 'Paste your Code To UML API key', password: true, ignoreFocusOut: true })
    if (key) { await context.secrets.store(TOKEN_KEY, key.trim()); vscode.window.showInformationMessage('Code To UML API key saved securely.') }
  }))
  context.subscriptions.push(vscode.commands.registerCommand('codeToUml.logout', async () => { await context.secrets.delete(TOKEN_KEY); vscode.window.showInformationMessage('Signed out of Code To UML.') }))

  context.subscriptions.push(vscode.commands.registerCommand('codeToUml.preview', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) return vscode.window.showWarningMessage('Open a diagram source file first.')
    const engine = await vscode.window.showQuickPick(['plantuml','mermaid','graphviz','d2','structurizr','nomnoml','dbml'], { placeHolder: 'Diagram engine' })
    if (!engine) return
    const token = await context.secrets.get(TOKEN_KEY)
    const response = await fetch(`${serverUrl()}/${engine}/svg`, { method: 'POST', headers: { 'Content-Type': 'text/plain', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: editor.document.getText() + '\n\n' })
    if (!response.ok) return vscode.window.showErrorMessage(`Render failed: ${await response.text()}`)
    const svg = await response.text()
    const panel = vscode.window.createWebviewPanel('codeToUml.preview', 'Code To UML Preview', vscode.ViewColumn.Beside, { enableScripts: false })
    panel.webview.html = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>body{background:#f8fafc;display:grid;place-items:center;min-height:95vh}svg{max-width:95%;max-height:95vh}</style>${svg}`
  }))
}

module.exports = { activate, deactivate() {} }
