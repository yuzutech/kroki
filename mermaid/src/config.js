import set from 'lodash/set.js'

export function updateConfig (initialConfig, config) {
  for (const property in Object.fromEntries(config)) {
    const propertyCamelCase = convertPropertyToCamelCase(property)
    if (propertyCamelCase === 'maxTextSize' ||
      propertyCamelCase === 'securityLevel' ||
      propertyCamelCase === 'secure' ||
      propertyCamelCase === 'startOnLoad') {
      // ignored for security reasons
      continue
    }
    const value = getTypedValue(config.get(property))
    set(initialConfig, propertyCamelCase, value)
  }
}

function convertPropertyToCamelCase (property) {
  const propertySplit = property.split('_')
  for (let i = 0; i < propertySplit.length; i++) {
    const split = propertySplit[i]
    const subSplit = split.split('-')
    if (subSplit.length > 1) {
      for (let j = 1; j < subSplit.length; j++) {
        subSplit[j] = subSplit[j].charAt(0).toUpperCase() + subSplit[j].substring(1)
      }
      propertySplit[i] = subSplit.join('')
    }
  }
  return propertySplit.join('.')
}

function getTypedValue (value) {
  if (value.toLowerCase() === 'true' || value.toLocaleString() === 'false') {
    return value === 'true'
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.substring(1, value.length - 1).split(',').map(item => this.getTypedValue(item))
  }
  if (!isNaN(value)) {
    return Number(value)
  }
  return value
}
