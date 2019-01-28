const Worker = require('./worker')
const Task = require('./task')
const instance = require('./browser-instance')
const micro = require('micro')

;(async () => {
  const browser = await instance.create()
  console.log(`Chrome accepting connections on endpoint ${browser.wsEndpoint()}`)
  const worker = new Worker(browser)
  const server = micro(async (req, res) => {
    const body = await micro.json(req, {limit: '1mb', encoding: 'utf8'})
    let diagramSource = body.diagram_source
    if (diagramSource) {
      try {
        const svg = await worker.convert(new Task(diagramSource))
        return micro.send(res, 200, svg)
      } catch (e) {
        console.log('e', e)
        return micro.send(res, 400, 'Unable to convert the diagram')
      }
    }
    micro.send(res, 400, 'Field diagram_source must not be empty.')
  })
  server.listen(3000)
})().catch(error => {
  console.error('Unable to start the service', error)
  process.exit(1)
})

