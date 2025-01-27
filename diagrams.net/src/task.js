export default class Task {
  constructor (source, isPng = false, isUnsafe = false) {
    this.source = source
    this.isPng = isPng
    this.isUnsafe = isUnsafe
  }
}
