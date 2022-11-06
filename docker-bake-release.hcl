variable "RELEASE_VERSION" {
}

target "kroki" {
  tags = ["yuzutech/kroki:${RELEASE_VERSION}"]
}

target "kroki-blockdiag" {
  tags = ["yuzutech/kroki-blockdiag:${RELEASE_VERSION}"]
}

target "kroki-mermaid" {
  tags = ["yuzutech/kroki-mermaid:${RELEASE_VERSION}"]
}

target "kroki-bpmn" {
  tags = ["yuzutech/kroki-bpmn:${RELEASE_VERSION}"]
}

target "kroki-excalidraw" {
  tags = ["yuzutech/kroki-excalidraw:${RELEASE_VERSION}"]
}

target "kroki-diagramsnet" {
  tags = ["yuzutech/kroki-diagramsnet:${RELEASE_VERSION}"]
}
