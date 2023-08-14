variable "RELEASE_VERSION" {
}

target "kroki" {
  tags = ["yuzutech/kroki:${RELEASE_VERSION}", "yuzutech/kroki:latest"]
}

target "kroki-mermaid" {
  tags = ["yuzutech/kroki-mermaid:${RELEASE_VERSION}", "yuzutech/kroki-mermaid:latest"]
}

target "kroki-bpmn" {
  tags = ["yuzutech/kroki-bpmn:${RELEASE_VERSION}", "yuzutech/kroki-bpmn:latest"]
}

target "kroki-excalidraw" {
  tags = ["yuzutech/kroki-excalidraw:${RELEASE_VERSION}", "yuzutech/kroki-excalidraw:latest"]
}

target "kroki-diagramsnet" {
  tags = ["yuzutech/kroki-diagramsnet:${RELEASE_VERSION}", "yuzutech/kroki-diagramsnet:latest"]
}

target "kroki-wireviz" {
  tags = ["yuzutech/kroki-wireviz:${RELEASE_VERSION}", "yuzutech/kroki-wireviz:latest"]
}
