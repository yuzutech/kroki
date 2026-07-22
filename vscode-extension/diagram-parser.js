const engineByExtension = {
  puml:'plantuml', plantuml:'plantuml', c4:'c4plantuml', c4puml:'c4plantuml', ditaa:'ditaa', blockdiag:'blockdiag', seqdiag:'seqdiag', actdiag:'actdiag',
  nwdiag:'nwdiag', packetdiag:'packetdiag', rackdiag:'rackdiag', umlet:'umlet', ux:'umlet', dot:'graphviz', gv:'graphviz', erd:'erd', svgbob:'svgbob',
  bob:'svgbob', symbolator:'symbolator', nomnoml:'nomnoml', mermaid:'mermaid', mmd:'mermaid', vega:'vega', vegalite:'vegalite', wavedrom:'wavedrom',
  bpmn:'bpmn', bytefield:'bytefield', excalidraw:'excalidraw', pikchr:'pikchr', structurizr:'structurizr', dsl:'structurizr', diagramsnet:'diagramsnet',
  drawio:'diagramsnet', d2:'d2', tikz:'tikz', dbml:'dbml', wireviz:'wireviz', goat:'goat'
}
const engineByLanguage = Object.fromEntries(Object.entries(engineByExtension).filter(([extension]) => !['c4','ux','bob','dsl','drawio'].includes(extension)))
const engineByFence = {
  uml:'plantuml', puml:'plantuml', plantuml:'plantuml', c4plantuml:'c4plantuml', c4:'c4plantuml',
  ditaa:'ditaa', blockdiag:'blockdiag', seqdiag:'seqdiag', actdiag:'actdiag', nwdiag:'nwdiag', packetdiag:'packetdiag', rackdiag:'rackdiag',
  umlet:'umlet', dot:'graphviz', gv:'graphviz', graphviz:'graphviz', erd:'erd', svgbob:'svgbob', bob:'svgbob', symbolator:'symbolator',
  nomnoml:'nomnoml', mermaid:'mermaid', mmd:'mermaid', vega:'vega', vegalite:'vegalite', 'vega-lite':'vegalite', wavedrom:'wavedrom',
  bpmn:'bpmn', bytefield:'bytefield', excalidraw:'excalidraw', pikchr:'pikchr', structurizr:'structurizr', diagramsnet:'diagramsnet', drawio:'diagramsnet',
  d2:'d2', tikz:'tikz', dbml:'dbml', wireviz:'wireviz', goat:'goat'
}
const supportedEngines = [...new Set(Object.values(engineByFence))]

function engineForFence(language) {
  const normalized = String(language || '').trim().toLowerCase().replace(/^\{\.?/, '').replace(/\}$/, '')
  return engineByFence[normalized] || null
}

function detectEngineFromSource(source) {
  const text = String(source || '').trim()
  if (/^@start(?:uml|mindmap|wbs|json|yaml)/im.test(text)) return 'plantuml'
  if (/^(?:%%\{[^\n]*\}\s*)?(?:flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|timeline|graph)\b/im.test(text)) return 'mermaid'
  if (/^(?:strict\s+)?(?:di)?graph\s+[\w"]*\s*\{/im.test(text)) return 'graphviz'
  if (/^Table\s+[\w".-]+\s*\{/im.test(text)) return 'dbml'
  if (/^workspace\s+["\w]/im.test(text)) return 'structurizr'
  if (/^[\w.-]+\s*(?:->|--|<->)\s*[\w.-]+/m.test(text) || /^direction:\s*(?:up|down|left|right)/im.test(text)) return 'd2'
  return null
}

function extractMarkdownDiagrams(markdown) {
  const text = String(markdown || '')
  const diagrams = []
  const fence = /^\s*(`{3,}|~{3,})\s*([^\s\r\n]+)?([^\r\n]*)\r?\n([\s\S]*?)^\s*\1\s*$/gm
  let match
  while ((match = fence.exec(text))) {
    const engine = engineForFence(match[2])
    if (!engine) continue
    const source = match[4].replace(/\s+$/, '')
    const explicit = String(match[3] || '').match(/\btitle\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s]+))/i)
    const metadataTitle = explicit ? (explicit[1] || explicit[2] || explicit[3]).trim() : ''
    const plainMetadata = String(match[3] || '').trim()
    const headings = [...text.slice(0, match.index).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)]
    const heading = headings.length ? headings[headings.length - 1][1].trim() : ''
    const plantUmlTitle = source.match(/^\s*@start(?:uml|mindmap|wbs)\s+([^\r\n]+)/im)
    const sourceTitle = source.match(/^\s*(?:%%\s*)?title\s*:\s*(.+)$/im)
    const title = metadataTitle || (plainMetadata && !/[={}]/.test(plainMetadata) ? plainMetadata : '') || heading || (plantUmlTitle && plantUmlTitle[1].trim()) || (sourceTitle && sourceTitle[1].trim()) || `Diagram ${diagrams.length + 1}`
    diagrams.push({ title, engine, source, index:diagrams.length })
  }
  return diagrams
}

function analyzeDocument({ fileName = '', languageId = '', source = '', defaultEngine = 'plantuml' }) {
  const extension = String(fileName).split('.').pop().toLowerCase()
  if (extension === 'md' || extension === 'markdown' || languageId === 'markdown') {
    const diagrams = extractMarkdownDiagrams(source)
    return { diagrams, confident:Boolean(diagrams.length), reason:diagrams.length ? 'markdown code fences' : 'markdown without diagram fences' }
  }
  const detected = engineByExtension[extension] || engineByLanguage[languageId] || detectEngineFromSource(source)
  const filename = String(fileName).split(/[\\/]/).pop().replace(/\.[^.]+$/, '') || 'Diagram'
  return { diagrams:[{ title:filename, engine:detected || defaultEngine, source:String(source), index:0 }], confident:Boolean(detected), reason:detected ? 'file or source' : 'default' }
}

module.exports = { analyzeDocument, extractMarkdownDiagrams, detectEngineFromSource, engineForFence, supportedEngines }
