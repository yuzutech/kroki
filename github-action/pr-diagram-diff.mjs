import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const extensionEngines = {
  puml:'plantuml', plantuml:'plantuml', c4puml:'c4plantuml', mmd:'mermaid', mermaid:'mermaid', dot:'graphviz', gv:'graphviz',
  d2:'d2', dbml:'dbml', ditaa:'ditaa', blockdiag:'blockdiag', seqdiag:'seqdiag', actdiag:'actdiag', nwdiag:'nwdiag',
  packetdiag:'packetdiag', rackdiag:'rackdiag', umlet:'umlet', ux:'umlet', erd:'erd', bob:'svgbob', svgbob:'svgbob',
  nomnoml:'nomnoml', vega:'vega', vlite:'vegalite', vegalite:'vegalite', wavedrom:'wavedrom', bpmn:'bpmn', bf:'bytefield',
  excalidraw:'excalidraw', pikchr:'pikchr', structurizr:'structurizr', drawio:'diagramsnet', tikz:'tikz', dbml:'dbml', yaml:'wireviz', goat:'goat'
}
const fenceEngines={uml:'plantuml',puml:'plantuml',plantuml:'plantuml',c4plantuml:'c4plantuml',mermaid:'mermaid',mmd:'mermaid',dot:'graphviz',graphviz:'graphviz',gv:'graphviz',d2:'d2',dbml:'dbml',ditaa:'ditaa',blockdiag:'blockdiag',seqdiag:'seqdiag',actdiag:'actdiag',nwdiag:'nwdiag',packetdiag:'packetdiag',rackdiag:'rackdiag',umlet:'umlet',erd:'erd',svgbob:'svgbob',symbolator:'symbolator',nomnoml:'nomnoml',vega:'vega',vegalite:'vegalite',wavedrom:'wavedrom',bpmn:'bpmn',bytefield:'bytefield',excalidraw:'excalidraw',pikchr:'pikchr',structurizr:'structurizr',diagramsnet:'diagramsnet',d2:'d2',tikz:'tikz',wireviz:'wireviz',goat:'goat'}

const cleanId = value => String(value || '').trim().replace(/^['"]|['"]$/g, '')
const cleanLabel = value => String(value || '').replace(/<[^>]+>/g, '').replace(/["'\[\]{}()]/g, ' ').replace(/\s+/g, ' ').trim()
const putNode = (model, id, label = id, signature = '') => {
  id=cleanId(id);if(!id)return
  if(model.nodes.has(id)&&cleanLabel(label)===id&&!signature)return
  model.nodes.set(id,{id,label:cleanLabel(label)||id,signature:signature||cleanLabel(label)||id})
}
const putEdge = (model, from, to, label = '') => {
  from=cleanId(from);to=cleanId(to);if(!from||!to)return
  putNode(model,from);putNode(model,to)
  const edge={from,to,label:cleanLabel(label)}
  model.edges.set(`${from}->${to}:${edge.label}`,edge)
}

export function parseDiagram(engine, source) {
  const model={nodes:new Map(),edges:new Map(),semantic:['plantuml','c4plantuml','mermaid','graphviz','d2','dbml'].includes(engine)}
  const text=String(source||'').replace(/\r/g,'')
  if(engine==='plantuml'||engine==='c4plantuml'){
    for(const match of text.matchAll(/^\s*(?:abstract\s+)?(class|component|interface|actor|database|node|queue|cloud|rectangle|package)\s+(?:"([^"]+)"\s+as\s+)?([\w.:-]+)(?:\s+as\s+"([^"]+)")?([^\n]*)/gmi))putNode(model,match[3],match[2]||match[4]||match[3],`${match[1]} ${match[5]}`)
    for(const match of text.matchAll(/^\s*participant\s+(?:"([^"]+)"\s+as\s+)?([\w.:-]+)/gmi))putNode(model,match[2],match[1]||match[2],'participant')
    for(const match of text.matchAll(/^\s*(?:Person|System|System_Ext|Container|Container_Ext|Component|Component_Ext|Database|Queue)\s*\(\s*([\w.:-]+)\s*,\s*"([^"]+)"([^\n]*)/gmi))putNode(model,match[1],match[2],match[3])
    for(const match of text.matchAll(/^\s*Rel(?:_[A-Z]+)?\s*\(\s*([\w.:-]+)\s*,\s*([\w.:-]+)\s*,\s*"([^"]*)"/gmi))putEdge(model,match[1],match[2],match[3])
    for(const match of text.matchAll(/^\s*(class|component|interface|database|node|package)\s+([\w.:-]+)[^{\n]*\{([\s\S]*?)^\s*\}/gmi))putNode(model,match[2],model.nodes.get(match[2])?.label||match[2],`${match[1]} ${match[3].replace(/\s+/g,' ').trim()}`)
    for(const match of text.matchAll(/^\s*([\w.:-]+)\s+[-.=ox*|<>]+(?:left|right|up|down)?[-.=ox*|<>]*\s+([\w.:-]+)\s*(?::\s*(.+))?$/gmi))putEdge(model,match[1],match[2],match[3])
  }else if(engine==='mermaid'){
    const token=/([A-Za-z_][\w.-]*)(?:\s*(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\}))?/g
    for(const line of text.split('\n')){
      if(!/(?:-->|---|-.->|==>|~~~)/.test(line))continue
      const parts=[...line.matchAll(token)].filter(match=>!['flowchart','graph','subgraph','end'].includes(match[1]))
      for(const part of parts)putNode(model,part[1],part[2]||part[3]||part[4]||part[1])
      if(parts.length>=2)putEdge(model,parts[0][1],parts.at(-1)[1],line.match(/\|([^|]+)\|/)?.[1]||'')
    }
    for(const match of text.matchAll(/^\s*([A-Za-z_][\w.-]*)\s*(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})/gm))putNode(model,match[1],match[2]||match[3]||match[4],match[0])
    for(const match of text.matchAll(/^\s*(?:participant|actor)\s+([\w.-]+)(?:\s+as\s+(.+))?$/gmi))putNode(model,match[1],match[2]||match[1],'participant')
    for(const match of text.matchAll(/^\s*([\w.-]+)\s*(?:--?>>|--?>|--?x|--?\))\s*([\w.-]+)\s*:\s*(.+)$/gm))putEdge(model,match[1],match[2],match[3])
  }else if(engine==='graphviz'){
    for(const match of text.matchAll(/^\s*("[^"]+"|[A-Za-z_][\w.-]*)\s*\[([^\]]+)\]/gm))putNode(model,match[1],match[2].match(/label\s*=\s*"([^"]+)"/)?.[1]||match[1],match[2])
    for(const match of text.matchAll(/("[^"]+"|[A-Za-z_][\w.-]*)\s*(?:->|--)\s*("[^"]+"|[A-Za-z_][\w.-]*)(?:\s*\[([^\]]+)\])?/g))putEdge(model,match[1],match[2],match[3]?.match(/label\s*=\s*"([^"]+)"/)?.[1]||'')
  }else if(engine==='d2'){
    for(const match of text.matchAll(/^\s*([\w.-]+)\s*:\s*([^\n{]+)/gm))putNode(model,match[1],match[2],match[0])
    for(const match of text.matchAll(/^\s*([\w.-]+)\s*(?:->|--|<->)\s*([\w.-]+)\s*(?::\s*(.+))?$/gm))putEdge(model,match[1],match[2],match[3])
  }else if(engine==='dbml'){
    for(const match of text.matchAll(/^\s*Table\s+([\w".-]+)\s*\{([\s\S]*?)^\s*\}/gmi))putNode(model,match[1],match[1],match[2].replace(/\s+/g,' ').trim())
    for(const match of text.matchAll(/^\s*Ref[^:]*:\s*([\w".-]+)\.[\w".-]+\s*[-<>]+\s*([\w".-]+)\.[\w".-]+/gmi))putEdge(model,match[1],match[2],match[0])
  }
  return model
}

export function extractMarkdown(source){
  const text=String(source||''),blocks=[],headings=[]
  for(const heading of text.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm))headings.push({index:heading.index,title:heading[1].trim()})
  const occurrences=new Map()
  for(const match of text.matchAll(/^\s*(`{3,}|~{3,})\s*([^\s\r\n]+)([^\r\n]*)\r?\n([\s\S]*?)^\s*\1\s*$/gm)){
    const language=match[2].toLowerCase().replace(/^\{\.?/,'').replace(/\}$/,'');const engine=fenceEngines[language];if(!engine)continue
    const explicit=match[3].match(/\btitle\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s]+))/i);const heading=headings.filter(item=>item.index<match.index).at(-1)?.title
    const title=(explicit&&(explicit[1]||explicit[2]||explicit[3]))||heading||`${engine} diagram`
    const identity=`${engine}:${title}`,occurrence=(occurrences.get(identity)||0)+1;occurrences.set(identity,occurrence)
    blocks.push({key:`${identity}:${occurrence}`,title,engine,source:match[4].replace(/\s+$/,'')})
  }
  return blocks
}

export function compareModels(before, after) {
  const changes=[]
  for(const [id,node] of before.nodes){const next=after.nodes.get(id);changes.push(!next?{...node,status:'removed'}:next.signature!==node.signature||next.label!==node.label?{...next,status:'modified'}:{...next,status:'unchanged'})}
  for(const [id,node] of after.nodes)if(!before.nodes.has(id))changes.push({...node,status:'added'})
  const edges=[],usedAfter=new Set()
  for(const [id,edge] of before.edges){
    if(after.edges.has(id)){edges.push({...edge,status:'unchanged'});usedAfter.add(id);continue}
    const replacement=[...after.edges].find(([nextId,next])=>!usedAfter.has(nextId)&&next.from===edge.from&&next.to===edge.to)
    if(replacement){edges.push({...replacement[1],status:'modified'});usedAfter.add(replacement[0])}
    else edges.push({...edge,status:'removed'})
  }
  for(const [id,edge] of after.edges)if(!usedAfter.has(id)&&!before.edges.has(id))edges.push({...edge,status:'added'})
  return {nodes:changes,edges}
}

const q=value=>`"${String(value).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,' ')}"`
const dotId=(fileIndex,id)=>`f${fileIndex}_${String(id).replace(/[^A-Za-z0-9_]/g,character=>`_${character.codePointAt(0).toString(16)}_`)}`
const colors={added:{fill:'#DCFCE7',stroke:'#16A34A',font:'#14532D'},modified:{fill:'#FEF3C7',stroke:'#D97706',font:'#78350F'},removed:{fill:'#FEE2E2',stroke:'#DC2626',font:'#7F1D1D'},unchanged:{fill:'#F8FAFC',stroke:'#94A3B8',font:'#334155'}}

export function buildDot(files,meta) {
  const lines=['digraph Changes {','graph [rankdir=LR,bgcolor="#FFFFFF",pad="0.35",nodesep="0.45",ranksep="0.8",fontname="Arial",label='+q(`Diagram changes · ${meta.base} → ${meta.head}`)+',labelloc=t,fontsize=22,fontcolor="#0F172A"];','node [shape=box,style="rounded,filled",fontname="Arial",fontsize=12,margin="0.16,0.10",penwidth=2];','edge [fontname="Arial",fontsize=10,color="#64748B",fontcolor="#475569",arrowsize=.75];']
  lines.push('subgraph cluster_legend { label="Legend"; color="#CBD5E1"; style="rounded,dashed"; legend_added [label="Added",fillcolor="#DCFCE7",color="#16A34A",fontcolor="#14532D"]; legend_modified [label="Modified",fillcolor="#FEF3C7",color="#D97706",fontcolor="#78350F"]; legend_removed [label="Removed",fillcolor="#FEE2E2",color="#DC2626",fontcolor="#7F1D1D"]; legend_added -> legend_modified -> legend_removed [style=invis]; }')
  files.forEach((file,fileIndex)=>{
    lines.push(`subgraph cluster_${fileIndex} { label=${q(`${file.path} · ${file.engine}`)}; color="#CBD5E1"; style="rounded"; bgcolor="#F8FAFC";`)
    if(!file.semantic){const c=colors[file.status];lines.push(`f${fileIndex}_file [label=${q(`${file.status.toUpperCase()} · structural parser unavailable`)},fillcolor="${c.fill}",color="${c.stroke}",fontcolor="${c.font}"];`)}
    const contextIds=new Set(file.diff.edges.filter(edge=>edge.status!=='unchanged').flatMap(edge=>[edge.from,edge.to]))
    const visibleNodes=file.diff.nodes.filter(node=>node.status!=='unchanged'||file.showUnchanged||contextIds.has(node.id))
    if(file.semantic&&!visibleNodes.length&&!file.diff.edges.some(edge=>edge.status!=='unchanged'))lines.push(`f${fileIndex}_nochange [label="Source changed · no semantic node/edge change",fillcolor="#F8FAFC",color="#94A3B8",fontcolor="#334155"];`)
    for(const node of visibleNodes){const c=colors[node.status];lines.push(`${dotId(fileIndex,node.id)} [label=${q(node.label)},fillcolor="${c.fill}",color="${c.stroke}",fontcolor="${c.font}",tooltip=${q(`${node.status}: ${node.id}`)}];`)}
    lines.push('}')
    for(const edge of file.diff.edges){if(edge.status==='unchanged'&&!file.showUnchanged)continue;const c=colors[edge.status];lines.push(`${dotId(fileIndex,edge.from)} -> ${dotId(fileIndex,edge.to)} [label=${q(edge.label)},color="${c.stroke}",fontcolor="${c.font}",style="${edge.status==='removed'?'dashed':'solid'}",penwidth=${edge.status==='unchanged'?1:2}];`)}
  })
  lines.push('}')
  return lines.join('\n')
}

function git(args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:20*1024*1024})}
function at(ref,file){try{return git(['show',`${ref}:${file}`])}catch{return ''}}
function writeOutput(name,value){if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`${name}=${value}\n`)}

async function main(){
  const event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'))
  const base=event.pull_request?.base?.sha||process.env.CTU_BASE_SHA
  const head=event.pull_request?.head?.sha||process.env.CTU_HEAD_SHA||'HEAD'
  if(!base)throw new Error('A pull request base SHA is required.')
  try{git(['fetch','--no-tags','--depth=1','origin',base])}catch{}
  const changed=git(['diff','--name-status',`${base}...${head}`]).trim().split('\n').filter(Boolean)
  const files=[]
  const append=(displayPath,engine,status,beforeSource,afterSource)=>{const before=parseDiagram(engine,beforeSource),after=parseDiagram(engine,afterSource);const semantic=before.semantic&&after.semantic&&(before.nodes.size>0||after.nodes.size>0);files.push({path:displayPath,engine,status,semantic,diff:compareModels(before,after),showUnchanged:false})}
  for(const row of changed){const [status,...names]=row.split('\t');const file=names.at(-1),oldFile=/^[RC]/.test(status)?names[0]:file,extension=path.extname(file).slice(1).toLowerCase();if(!extensionEngines[extension]&&!['md','markdown'].includes(extension))continue
    const beforeSource=status==='A'?'':at(base,oldFile),afterSource=status==='D'?'':at(head,file)
    const fileStatus=status==='A'?'added':status==='D'?'removed':'modified'
    if(['md','markdown'].includes(extension)){
      const beforeBlocks=new Map(extractMarkdown(beforeSource).map(block=>[block.key,block])),afterBlocks=new Map(extractMarkdown(afterSource).map(block=>[block.key,block]))
      for(const key of new Set([...beforeBlocks.keys(),...afterBlocks.keys()])){const oldBlock=beforeBlocks.get(key),newBlock=afterBlocks.get(key);if(oldBlock?.source===newBlock?.source)continue;const block=newBlock||oldBlock;append(`${file} · ${block.title}`,block.engine,!oldBlock?'added':!newBlock?'removed':'modified',oldBlock?.source||'',newBlock?.source||'')}
    }else append(file,extensionEngines[extension],fileStatus,beforeSource,afterSource)
  }
  const output=process.env.CTU_DIFF_OUTPUT||'artifacts/diagram-pr-diff.svg'
  fs.mkdirSync(path.dirname(output),{recursive:true})
  if(!files.length){writeOutput('changed','false');writeOutput('diagram-count','0');console.log('No changed diagram files.');return}
  const dot=buildDot(files,{base:event.pull_request?.base?.ref||base.slice(0,7),head:event.pull_request?.head?.ref||head.slice(0,7)})
  const headers={'Content-Type':'text/plain','Accept':'image/svg+xml'};if(process.env.CTU_API_KEY)headers.Authorization=`Bearer ${process.env.CTU_API_KEY}`
  const response=await fetch(`${process.env.CTU_SERVER.replace(/\/$/,'')}/graphviz/svg`,{method:'POST',headers,body:dot})
  if(!response.ok)throw new Error(`Render failed: HTTP ${response.status} ${await response.text()}`)
  fs.writeFileSync(output,Buffer.from(await response.arrayBuffer()))
  const counts={added:0,modified:0,removed:0};for(const file of files)for(const node of file.diff.nodes)if(counts[node.status]!==undefined)counts[node.status]++
  writeOutput('changed','true');writeOutput('diagram-count',String(files.length));writeOutput('added',String(counts.added));writeOutput('modified',String(counts.modified));writeOutput('removed',String(counts.removed));writeOutput('output',output)
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Code To UML · PR diagram diff\n\n- Diagram files: **${files.length}**\n- Added nodes: **${counts.added}**\n- Modified nodes: **${counts.modified}**\n- Removed nodes: **${counts.removed}**\n- Artifact: \`${output}\`\n`)
  if(process.env.CTU_COMMENT==='true'&&process.env.GITHUB_TOKEN&&event.pull_request){
    const marker='<!-- code-to-uml-pr-diff -->',api=`${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}`,headers={Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','Content-Type':'application/json'}
    const details=files.map(file=>`- \`${file.path}\` (${file.engine})${file.semantic?'':' — file-level fallback'}`).join('\n')
    const body=`${marker}\n## Code To UML · Diagram changes\n\n🟢 **${counts.added} added** · 🟡 **${counts.modified} modified** · 🔴 **${counts.removed} removed** across **${files.length} diagram file(s)**.\n\n${details}\n\n[Download the generated SVG from this workflow run](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}).`
    const commentsResponse=await fetch(`${api}/issues/${event.pull_request.number}/comments?per_page=100`,{headers}),comments=commentsResponse.ok?await commentsResponse.json():[]
    const previous=comments.find(comment=>comment.body?.includes(marker))
    const commentResponse=await fetch(previous?`${api}/issues/comments/${previous.id}`:`${api}/issues/${event.pull_request.number}/comments`,{method:previous?'PATCH':'POST',headers,body:JSON.stringify({body})})
    if(!commentResponse.ok)console.warn(`Unable to publish PR comment: HTTP ${commentResponse.status}`)
  }
}

if(path.resolve(process.argv[1]||'')===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error);process.exit(1)})
