import * as Y from 'yjs'

class CollaborationClient {
  constructor ({ url, diagramId, shareToken, textarea, onStatus, onPresence, onMetadata }) {
    this.doc = new Y.Doc()
    this.text = this.doc.getText('source')
    this.textarea = textarea
    this.onStatus = onStatus || (() => {})
    this.onPresence = onPresence || (() => {})
    this.onMetadata = onMetadata || (() => {})
    this.applyingRemote = false
    this.synced = false
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const token = shareToken ? `?share=${encodeURIComponent(shareToken)}` : ''
    this.socket = new WebSocket(`${protocol}//${location.host}/ws/diagrams/${diagramId}${token}`)
    this.socket.addEventListener('open', () => this.onStatus('connected'))
    this.socket.addEventListener('close', e => this.onStatus(e.code === 4003 ? 'forbidden' : 'disconnected'))
    this.socket.addEventListener('error', () => this.onStatus('error'))
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data)
      if (message.type === 'sync' || message.type === 'update') {
        Y.applyUpdate(this.doc, this.fromBase64(message.update), 'remote')
        if (message.type === 'sync') { this.synced = true; this.onMetadata(message.metadata || {}) }
      } else if (message.type === 'presence') this.onPresence(message.users || [])
    })
    this.doc.on('update', (update, origin) => {
      if (origin !== 'remote' && this.socket.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify({ type:'update', update:this.toBase64(update) }))
    })
    this.text.observe(() => {
      this.applyingRemote = true
      const start = textarea.selectionStart, end = textarea.selectionEnd
      textarea.value = this.text.toString()
      textarea.setSelectionRange(Math.min(start,textarea.value.length), Math.min(end,textarea.value.length))
      this.applyingRemote = false
      textarea.dispatchEvent(new CustomEvent('collaboration-change'))
    })
    this.inputHandler = () => {
      if (this.applyingRemote || !this.synced) return
      const oldValue=this.text.toString(), newValue=textarea.value
      let prefix=0
      while(prefix<oldValue.length && prefix<newValue.length && oldValue[prefix]===newValue[prefix])prefix++
      let oldSuffix=oldValue.length,newSuffix=newValue.length
      while(oldSuffix>prefix && newSuffix>prefix && oldValue[oldSuffix-1]===newValue[newSuffix-1]){oldSuffix--;newSuffix--}
      this.doc.transact(()=>{if(oldSuffix>prefix)this.text.delete(prefix,oldSuffix-prefix);if(newSuffix>prefix)this.text.insert(prefix,newValue.slice(prefix,newSuffix))},'local')
    }
    textarea.addEventListener('input', this.inputHandler)
  }
  toBase64 (bytes) { let value=''; for(let i=0;i<bytes.length;i++)value+=String.fromCharCode(bytes[i]); return btoa(value) }
  fromBase64 (value) { const raw=atob(value),bytes=new Uint8Array(raw.length); for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i); return bytes }
  destroy () { this.textarea.removeEventListener('input',this.inputHandler); this.socket.close(); this.doc.destroy() }
}

window.CollaborationClient = CollaborationClient
