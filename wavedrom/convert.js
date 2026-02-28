const json5 = require('json5')
const wavedrom = require('wavedrom')
const onml = require('onml')

const waveSkin = {
  dark: require('wavedrom/skins/dark.js').dark,
  default: require('wavedrom/skins/default.js').default,
  lowkey: require('wavedrom/skins/lowkey.js').lowkey,
  narrow: require('wavedrom/skins/narrow.js').narrow,
  narrower: require('wavedrom/skins/narrower.js').narrower,
  narrowerer: require('wavedrom/skins/narrowerer.js').narrowerer
}

function convert (source) {
  if (source === '') {
    return
  }
  const json = json5.parse(source)
  const result = wavedrom.renderAny(0, json, waveSkin)
  return onml.s(result)
}

module.exports = {
  convert
}
