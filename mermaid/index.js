const worker = require('./worker')
const chrome = require('./chrome')
const micro = require('micro')

;(async () => {
  const browserWsEndpoint = await chrome.init()
  console.log(`Chrome accepting connections on endpoint ${browserWsEndpoint}`)
  const server = micro(async (req, res) => {
    const body = await micro.json(req, { limit: '1mb', encoding: 'utf8' })
    let diagramSource = body.diagram_source
    if (diagramSource) {
      try {
        console.log('convert ' + diagramSource)
        const svg = await worker.convert(diagramSource)
        console.log('svg ' + svg)
        return micro.send(res, 200, svg)
      } catch (e) {
        console.log('e', e)
        return micro.send(res, 400, 'Unable to convert diagram')
      }
    }
    micro.send(res, 400, '')
  })
  server.listen(3000)
})().catch(error => {
  console.error('Unable to start the service', error)
  process.exit(1)
})

