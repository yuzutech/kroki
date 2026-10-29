export default class Task {
  constructor(source, isPng = false, safeMode = 'secure') {
    this.source = source
    this.isPng = isPng
    this.safeMode = safeMode
  }
}
