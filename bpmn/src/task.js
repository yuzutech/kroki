export default class Task {
  constructor(source, safeMode = 'secure') {
    this.source = source
    this.safeMode = safeMode
    this.bpmnConfig = {}
  }
}
