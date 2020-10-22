class Task {
  constructor (source) {
    this.source = source
    this.mermaidConfig = {
      theme: 'default',
      class: {
        useMaxWidth: false,
      },
      er: {
        useMaxWidth: false,
      },
      flowchart: {
        useMaxWidth: false,
      },
      gantt: {
        useMaxWidth: false,
      },
      git: {
        useMaxWidth: false,
      },
      journey: {
        useMaxWidth: false,
      },
      sequence: {
        useMaxWidth: false,
      },
      state: {
        useMaxWidth: false,
      }
    }
  }
}

module.exports = Task
