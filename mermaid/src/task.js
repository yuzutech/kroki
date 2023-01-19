class Task {
  constructor (source, mode = 'svg') {
    this.source = source
    this.mode = mode
    this.mermaidConfig = {
      theme: 'default',
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

module.exports = Task
