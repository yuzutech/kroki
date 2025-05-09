export default class Task {
  constructor(source, isPng, width, height, showTitle, background = "white") {
    this.source = source
    this.isPng = isPng
    this.width = width
    this.height = height
    this.showTitle = showTitle
    this.background = background
  }
}
