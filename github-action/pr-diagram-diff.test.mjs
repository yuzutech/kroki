import test from 'node:test'
import assert from 'node:assert/strict'
import { parseDiagram, compareModels, buildDot, extractMarkdown } from './pr-diagram-diff.mjs'

test('PlantUML identifies added, removed and modified classes',()=>{
  const before=parseDiagram('plantuml','@startuml\nclass User {\n +name: String\n}\nclass Legacy\n@enduml')
  const after=parseDiagram('plantuml','@startuml\nclass User {\n +email: String\n}\nclass Account\n@enduml')
  const diff=compareModels(before,after)
  assert.equal(diff.nodes.find(node=>node.id==='User').status,'modified')
  assert.equal(diff.nodes.find(node=>node.id==='Legacy').status,'removed')
  assert.equal(diff.nodes.find(node=>node.id==='Account').status,'added')
})

test('Mermaid identifies a changed node label',()=>{
  const diff=compareModels(parseDiagram('mermaid','flowchart LR\n A[Old] --> B[API]'),parseDiagram('mermaid','flowchart LR\n A[New] --> B[API]'))
  assert.equal(diff.nodes.find(node=>node.id==='A').status,'modified')
})

test('D2 identifies a changed edge as modified',()=>{
  const diff=compareModels(parseDiagram('d2','a -> b: old'),parseDiagram('d2','a -> b: new'))
  assert.equal(diff.edges.length,1)
  assert.equal(diff.edges[0].status,'modified')
})

test('DOT output uses the requested scientific color legend',()=>{
  const before=parseDiagram('dbml','Table users {\n id int\n}\nTable old {\n id int\n}')
  const after=parseDiagram('dbml','Table users {\n id uuid\n}\nTable fresh {\n id int\n}')
  const dot=buildDot([{path:'schema.dbml',engine:'dbml',semantic:true,diff:compareModels(before,after),showUnchanged:false}],{base:'main',head:'feature'})
  assert.match(dot,/#DCFCE7/)
  assert.match(dot,/#FEF3C7/)
  assert.match(dot,/#FEE2E2/)
  assert.match(dot,/schema\.dbml/)
})

test('Markdown is split into named diagram blocks',()=>{
  const blocks=extractMarkdown('# Architecture\n\n## Flow\n```mermaid\nflowchart LR\nA --> B\n```\n\n## Data\n```dbml title="Main schema"\nTable users {\n id int\n}\n```')
  assert.equal(blocks.length,2)
  assert.equal(blocks[0].title,'Flow')
  assert.equal(blocks[1].title,'Main schema')
  assert.deepEqual(blocks.map(block=>block.engine),['mermaid','dbml'])
})

test('C4 macros and Mermaid sequence messages become semantic edges',()=>{
  const c4=parseDiagram('c4plantuml','Person(user, "User")\nSystem(api, "API")\nRel(user, api, "Calls")')
  assert.deepEqual([...c4.nodes.keys()],['user','api'])
  assert.equal([...c4.edges.values()][0].label,'Calls')
  const sequence=parseDiagram('mermaid','sequenceDiagram\nparticipant U as User\nparticipant A as API\nU->>A: Login')
  assert.equal(sequence.nodes.get('U').label,'User')
  assert.equal([...sequence.edges.values()][0].label,'Login')
})
