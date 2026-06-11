// Hard cap on the diagram source length. mermaid renders an "Maximum text size
// in diagram exceeded" *image* (HTTP 200) when its own maxTextSize is hit; we
// set the same value here so we can reject oversized sources up front with a
// 4xx instead (see worker.js). Non-overridable by the request (see config.js).
export const MAX_TEXT_SIZE = Number(process.env.KROKI_MERMAID_MAX_TEXT_SIZE) || 50000

export default class Task {
  constructor(source, isPng = false) {
    this.source = source
    this.isPng = isPng
    this.mermaidConfig = {
      theme: 'default',
      maxTextSize: MAX_TEXT_SIZE,
      class: {
        useMaxWidth: false
      },
      er: {
        useMaxWidth: false
      },
      flowchart: {
        useMaxWidth: false
      },
      gantt: {
        useMaxWidth: false
      },
      git: {
        useMaxWidth: false
      },
      journey: {
        useMaxWidth: false
      },
      sequence: {
        useMaxWidth: false
      },
      state: {
        useMaxWidth: false
      }
    }
  }
}
