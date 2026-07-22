const vscode = require('vscode')
const zlib = require('zlib')
const { analyzeDocument, engineForFence } = require('./diagram-parser')

const TOKEN_KEY = 'codeToUml.token'
const config = () => vscode.workspace.getConfiguration('codeToUml')
const serverUrl = () => String(config().get('serverUrl') || 'http://localhost:8000').replace(/\/$/, '')

let previewPanel
let previewDocument
let previewTimer
let renderSequence = 0
let sidebarProvider
let profileTimer
let invalidatingKey = false

function markdownPlugin(md) {
  const originalFence = md.renderer.rules.fence || ((tokens, index, options, environment, renderer) => renderer.renderToken(tokens, index, options))
  md.renderer.rules.fence = (tokens, index, options, environment, renderer) => {
    const token = tokens[index]
    const info = String(token.info || '').trim()
    const languageToken = info.split(/\s+/, 1)[0].toLowerCase().replace(/^\{\.?/, '').replace(/\}$/, '')
    const engine = engineForFence(languageToken)
    if (!engine) return originalFence(tokens, index, options, environment, renderer)
    const explicit = info.match(/\btitle\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s]+))/i)
    let title = explicit ? explicit[1] || explicit[2] || explicit[3] : ''
    if (!title) {
      for (let cursor = index - 1; cursor >= 1; cursor--) {
        if (tokens[cursor].type === 'heading_close' && tokens[cursor - 1]?.type === 'inline') { title=tokens[cursor - 1].content;break }
        if (tokens[cursor].type === 'fence') break
      }
    }
    title = title || `${engine.charAt(0).toUpperCase()}${engine.slice(1)} diagram`
    const encoded = zlib.deflateSync(Buffer.from(token.content, 'utf8'), { level:9 }).toString('base64url')
    const imageUrl = `${serverUrl()}/${engine}/svg/${encoded}`
    const safeTitle = md.utils.escapeHtml(title)
    const safeUrl = md.utils.escapeHtml(imageUrl)
    return `<figure class="code-to-uml-markdown-diagram"><figcaption><strong>${safeTitle}</strong> <small>(${engine})</small></figcaption><img src="${safeUrl}" alt="${safeTitle}" loading="lazy"></figure>`
  }
  return md
}

function detectEngine(document) {
  const analysis = diagramsFor(document)
  return { engine:analysis.diagrams[0]?.engine || config().get('defaultEngine') || 'plantuml', confident:analysis.confident, reason:analysis.reason }
}
const engineFor = document => detectEngine(document).engine

function diagramsFor(document) {
  return analyzeDocument({ fileName:document.fileName, languageId:document.languageId, source:document.getText(), defaultEngine:config().get('defaultEngine') || 'plantuml' })
}

async function authHeaders(context) {
  const token = await context.secrets.get(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchProfile(token) {
  if (!token) return null
  const response = await fetch(`${serverUrl()}/api/auth/me`, { headers:{ Authorization:`Bearer ${token}` } })
  if (!response.ok) throw Object.assign(new Error(response.status === 401 ? 'Invalid or expired API key' : `Profile request failed with HTTP ${response.status}`), { status:response.status })
  return response.json()
}

async function invalidateKey(context, message = 'Your API key was revoked or expired.') {
  if(invalidatingKey)return
  invalidatingKey=true
  await context.secrets.delete(TOKEN_KEY)
  await sidebarProvider?.refresh()
  vscode.window.showWarningMessage(`${message} Code To UML returned to Local mode.`)
  invalidatingKey=false
}

async function renderSource(context, source, engine, format = 'svg') {
  const response = await fetch(`${serverUrl()}/${engine}/${format}`, {
    method: 'POST',
    headers: { 'Content-Type':'text/plain', Accept:format === 'svg' ? 'image/svg+xml' : format === 'pdf' ? 'application/pdf' : `image/${format}`, ...(await authHeaders(context)) },
    body: source + '\n\n'
  })
  if(response.status===401){await invalidateKey(context);throw new Error('Authentication required')}
  if (!response.ok) throw new Error((await response.text()) || `Render failed with HTTP ${response.status}`)
  return { body:Buffer.from(await response.arrayBuffer()), engine }
}

function legacyPreviewHtml(svg, engine) {
  const safeEngine = String(engine).replace(/[<>&"']/g, '')
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>body{margin:0;min-height:100vh;display:grid;grid-template-rows:36px 1fr;background:#0b1220;color:#dbe7f7;font:12px system-ui}.bar{display:flex;align-items:center;padding:0 12px;border-bottom:1px solid #26344d;background:#111b2d}.stage{display:grid;place-items:center;overflow:auto;padding:24px;background:#f8fafc}svg{max-width:100%;height:auto;filter:drop-shadow(0 8px 20px #0f172a22)}</style></head><body><div class="bar">${safeEngine} · live preview</div><div class="stage">${svg}</div></body></html>`
}

const escapeHtml = value => String(value || '').replace(/[<>&"']/g, character => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[character]))

function previewHtml(items, fileName) {
  const cards = items.length ? items.map(item => `<section class="card"><header><h2>${escapeHtml(item.title)}</h2><span>${escapeHtml(item.engine)}</span></header><div class="stage">${item.error ? `<pre>${escapeHtml(item.error)}</pre>` : item.svg}</div></section>`).join('') : '<div class="empty"><h2>No diagrams found</h2><p>Add a fenced block such as <code>```mermaid</code>, <code>```plantuml</code>, <code>```dot</code> or <code>```d2</code>.</p></div>'
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#0b1220;color:#dbe7f7;font:13px system-ui}.bar{position:sticky;top:0;z-index:2;height:44px;padding:13px 18px;border-bottom:1px solid #26344d;background:#111b2d;font-weight:650}.list{display:grid;gap:18px;padding:18px}.card{overflow:hidden;border:1px solid #26344d;border-radius:10px;background:#111b2d}.card header{padding:12px 16px;border-bottom:1px solid #26344d}.card h2{display:inline;margin:0 10px 0 0;font-size:14px}.card span{color:#7dd3fc;font-size:11px;text-transform:uppercase}.stage{display:grid;min-height:240px;place-items:center;overflow:auto;padding:24px;background:#f8fafc}.stage svg{max-width:100%;height:auto;filter:drop-shadow(0 8px 20px #0f172a22)}pre{max-width:100%;white-space:pre-wrap;color:#be123c}.empty{margin:18px;padding:28px;border:1px dashed #3b4b68;border-radius:10px;text-align:center;color:#9fb0ca}code{color:#7dd3fc}</style></head><body><div class="bar">${escapeHtml(fileName)} · ${items.length} diagram${items.length === 1 ? '' : 's'}</div><main class="list">${cards}</main></body></html>`
}

async function updatePreview(context, document, immediate = false) {
  if (!previewPanel || previewPanel.disposed || !document) return
  clearTimeout(previewTimer)
  const run = async () => {
    const sequence = ++renderSequence
    try {
      const analysis = diagramsFor(document)
      const results = await Promise.all(analysis.diagrams.map(async diagram => {
        try { const result = await renderSource(context, diagram.source, diagram.engine, 'svg');return { ...diagram, svg:result.body.toString('utf8') } }
        catch (error) { return { ...diagram, error:error.message } }
      }))
      if (sequence !== renderSequence || !previewPanel) return
      previewPanel.webview.html = previewHtml(results, document.fileName.split(/[\\/]/).pop())
    } catch (error) {
      if (sequence === renderSequence) previewPanel.webview.html = previewHtml([{ title:'Preview error', engine:engineFor(document), error:error.message }], document.fileName.split(/[\\/]/).pop())
    }
  }
  if (immediate) await run(); else previewTimer = setTimeout(run, Number(config().get('previewDelay') || 350))
}

async function openPreview(context, document = vscode.window.activeTextEditor?.document) {
  if (!document) return vscode.window.showWarningMessage('Open a diagram source file first.')
  previewDocument = document
  if (!previewPanel) {
    previewPanel = vscode.window.createWebviewPanel('codeToUml.preview', 'Code To UML Preview', vscode.ViewColumn.Beside, { enableScripts:false, retainContextWhenHidden:true })
    previewPanel.onDidDispose(() => { previewPanel = undefined; previewDocument = undefined; clearTimeout(previewTimer) })
  } else previewPanel.reveal(vscode.ViewColumn.Beside, true)
  await updatePreview(context, previewDocument, true)
}

function svgSize(svg) {
  const viewBox = String(svg).match(/viewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i)
  if (viewBox) return { width:Number(viewBox[1]), height:Number(viewBox[2]) }
  const width = String(svg).match(/\bwidth=["']([\d.]+)(?:px)?["']/i)
  const height = String(svg).match(/\bheight=["']([\d.]+)(?:px)?["']/i)
  return { width:Number(width?.[1] || 1000), height:Number(height?.[1] || 600) }
}

function combineSvgDiagrams(rendered) {
  const padding = 32, titleHeight = 34, gap = 24
  const items = rendered.map(item => ({ ...item, ...svgSize(item.svg) }))
  const width = Math.max(320, ...items.map(item => item.width)) + padding * 2
  const height = padding + items.reduce((total, item) => total + titleHeight + item.height + gap, 0)
  let y = padding
  const content = items.map(item => {
    const titleY = y + 20
    const imageY = y + titleHeight
    const imageX = (width - item.width) / 2
    y = imageY + item.height + gap
    const data = Buffer.from(item.svg, 'utf8').toString('base64')
    return `<text x="${padding}" y="${titleY}" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#e5eefc">${escapeHtml(item.title)} <tspan font-size="12" font-weight="400" fill="#7dd3fc">${escapeHtml(item.engine)}</tspan></text><image x="${imageX}" y="${imageY}" width="${item.width}" height="${item.height}" href="data:image/svg+xml;base64,${data}"/>`
  }).join('')
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#0b1220"/>${content}</svg>`, 'utf8')
}

async function exportDiagram(context) {
  const editor = vscode.window.activeTextEditor
  if (!editor) return vscode.window.showWarningMessage('Open a diagram source file first.')
  const diagrams = diagramsFor(editor.document).diagrams
  if (!diagrams.length) return vscode.window.showWarningMessage('No supported diagram blocks found in this file.')
  const selection = diagrams.length === 1 ? { diagram:diagrams[0] } : await vscode.window.showQuickPick([
    { label:'$(files) All diagrams', description:'Combine into one SVG image', all:true },
    ...diagrams.map(item => ({ label:`$(symbol-structure) ${item.title}`, description:item.engine, detail:`Export only this ${item.engine} diagram`, diagram:item }))
  ], { placeHolder:'Choose a diagram to export' })
  if (!selection) return
  const diagram = selection.diagram
  const format = selection.all ? 'svg' : await vscode.window.showQuickPick(['svg','png','pdf'], { placeHolder:'Export format' })
  if (!format) return
  const safeTitle = selection.all ? 'all-diagrams' : diagram.title.replace(/[<>:"/\\|?*]+/g, '-').trim() || 'diagram'
  const baseName = editor.document.fileName.replace(/\.[^.]+$/, '')
  const defaultName = diagrams.length > 1 ? `${baseName}-${safeTitle}.${format}` : `${baseName}.${format}`
  const target = await vscode.window.showSaveDialog({ defaultUri:vscode.Uri.file(defaultName), filters:{ [format.toUpperCase()]:[format] } })
  if (!target) return
  try {
    if (selection.all) {
      const attempts = await Promise.all(diagrams.map(async item => {
        try { return { ok:true, item:{ ...item, svg:(await renderSource(context, item.source, item.engine, 'svg')).body.toString('utf8') } } }
        catch (error) { return { ok:false, item, error:error.message } }
      }))
      const rendered = attempts.filter(attempt => attempt.ok).map(attempt => attempt.item)
      const skipped = attempts.filter(attempt => !attempt.ok)
      if (!rendered.length) throw new Error('None of the diagrams could be rendered.')
      await vscode.workspace.fs.writeFile(target, combineSvgDiagrams(rendered))
      if (skipped.length) {
        const names = skipped.map(attempt => `${attempt.item.title} (${attempt.item.engine})`).join(', ')
        vscode.window.showWarningMessage(`Exported ${rendered.length}/${diagrams.length} diagrams. Skipped invalid diagrams: ${names}.`)
      } else vscode.window.showInformationMessage(`Exported all ${rendered.length} diagrams as one SVG to ${target.fsPath}.`)
    } else {
      const result = await renderSource(context, diagram.source, diagram.engine, format)
      await vscode.workspace.fs.writeFile(target, result.body)
      vscode.window.showInformationMessage(`Exported ${result.engine} diagram to ${target.fsPath}.`)
    }
  } catch (error) { vscode.window.showErrorMessage(`Export failed: ${error.message}`) }
}

class SidebarProvider {
  constructor(context) { this.context=context;this.view=null }
  resolveWebviewView(view) {
    this.view=view
    view.webview.options = { enableScripts:true }
    this.refresh()
    view.webview.onDidReceiveMessage(message => {
      if (message.command === 'settings') vscode.commands.executeCommand('workbench.action.openSettings', '@ext:code-to-uml.code-to-uml')
      else if (typeof message.command === 'string' && message.command.startsWith('codeToUml.')) vscode.commands.executeCommand(message.command)
    })
  }
  async refresh() {
    if(!this.view)return
    let profile=null,profileError=''
    const token=await this.context.secrets.get(TOKEN_KEY)
    if(token)try{profile=await fetchProfile(token)}catch(error){profileError=error.message}
    this.view.webview.html=this.html(profile,profileError)
  }
  html(profile,profileError) {
    const nonce = String(Date.now())
    const escape=value=>String(value||'').replace(/[<>&"']/g,character=>({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[character]))
    const account=profile?`<div class="account"><div class="avatar">${escape(profile.display_name).slice(0,1).toUpperCase()}</div><div><strong>Hello, ${escape(profile.display_name)}</strong><small>${escape(profile.email)}</small></div></div>`:profileError?`<div class="account error">${escape(profileError)}</div>`:`<div class="account"><div><strong>Local mode</strong><small>No API key required</small></div></div>`
    return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'"><style>
      body{padding:14px;color:var(--vscode-foreground);background:var(--vscode-sideBar-background);font:13px var(--vscode-font-family)}
      .hero{padding:14px;margin-bottom:14px;border:1px solid var(--vscode-widget-border);border-radius:8px;background:var(--vscode-editorWidget-background)}
      .logo{width:34px;height:34px;display:grid;place-items:center;margin-bottom:11px;border-radius:9px;color:var(--vscode-button-foreground);background:var(--vscode-button-background);font-weight:800}
      h2{margin:0 0 6px;font-size:15px}p{margin:0;color:var(--vscode-descriptionForeground);line-height:1.45}
      .actions{display:grid;gap:8px}button{width:100%;padding:9px 10px;text-align:left;color:var(--vscode-button-secondaryForeground);background:var(--vscode-button-secondaryBackground);border:1px solid var(--vscode-widget-border);border-radius:6px;cursor:pointer;font:inherit}button:hover{background:var(--vscode-button-secondaryHoverBackground)}button.primary{color:var(--vscode-button-foreground);background:var(--vscode-button-background);border-color:transparent}button.primary:hover{background:var(--vscode-button-hoverBackground)}
      .section{margin:18px 0 8px;color:var(--vscode-descriptionForeground);font-size:11px;text-transform:uppercase;letter-spacing:.08em}
      .account{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:11px;border:1px solid var(--vscode-widget-border);border-radius:8px;background:var(--vscode-editorWidget-background)}.account.error{color:var(--vscode-errorForeground)}.avatar{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;color:var(--vscode-button-foreground);background:var(--vscode-button-background);font-weight:800}.account strong,.account small{display:block}.account small{margin-top:3px;color:var(--vscode-descriptionForeground);overflow:hidden;text-overflow:ellipsis}
    </style></head><body><div class="hero"><div class="logo">C</div><h2>Code To UML</h2><p>Live preview, render-on-save and export through your configured service.</p></div>${account}<div class="actions"><button class="primary" data-command="codeToUml.preview">Open Live Preview</button><button data-command="codeToUml.export">Export SVG / PNG / PDF</button></div><div class="section">Hosted service</div><div class="actions"><button data-command="codeToUml.apiKey">Set API Key</button><button data-command="codeToUml.clearKey">Clear API Key</button><button data-command="settings">Extension Settings</button></div><script nonce="${nonce}">const vscode=acquireVsCodeApi();document.querySelectorAll('[data-command]').forEach(button=>button.onclick=()=>vscode.postMessage({command:button.dataset.command}))</script></body></html>`
  }
}

async function activate(context) {
  sidebarProvider=new SidebarProvider(context)
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('codeToUml.sidebar', sidebarProvider, { webviewOptions:{ retainContextWhenHidden:true } }))
  context.subscriptions.push(vscode.commands.registerCommand('codeToUml.apiKey', async () => {
    const key = await vscode.window.showInputBox({ prompt:'Paste your Code To UML API key', password:true, ignoreFocusOut:true })
    if (key) try { const normalized=key.trim(),profile=await fetchProfile(normalized);await context.secrets.store(TOKEN_KEY,normalized);await sidebarProvider.refresh();vscode.window.showInformationMessage(`Connected to Code To UML as ${profile.display_name}.`) } catch(error) { vscode.window.showErrorMessage(`API key rejected: ${error.message}`) }
  }))
  context.subscriptions.push(vscode.commands.registerCommand('codeToUml.clearKey', async () => { await context.secrets.delete(TOKEN_KEY);await sidebarProvider.refresh();vscode.window.showInformationMessage('Code To UML API key cleared.') }))
  context.subscriptions.push(vscode.commands.registerCommand('codeToUml.preview', () => openPreview(context)))
  context.subscriptions.push(vscode.commands.registerCommand('codeToUml.export', () => exportDiagram(context)))
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => { if (previewPanel && event.document === previewDocument && config().get('livePreview')) updatePreview(context, event.document) }))
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => { if (!config().get('renderOnSave')) return;const detected=detectEngine(document);if (!detected.confident && document !== previewDocument) return;if (!previewPanel) openPreview(context, document);else if (document === previewDocument) updatePreview(context, document, true) }))
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => { if (previewPanel && editor && config().get('followActiveEditor') && detectEngine(editor.document).confident) { previewDocument=editor.document; updatePreview(context, previewDocument, true) } }))
  profileTimer=setInterval(async()=>{const token=await context.secrets.get(TOKEN_KEY);if(!token)return;try{await fetchProfile(token)}catch(error){if(error.status===401)await invalidateKey(context)}},3000)
  context.subscriptions.push({dispose:()=>clearInterval(profileTimer)})
  return { extendMarkdownIt:markdownPlugin }
}

module.exports = { activate, deactivate() { clearTimeout(previewTimer);clearInterval(profileTimer);previewPanel?.dispose() } }
