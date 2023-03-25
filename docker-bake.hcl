variable "TAG" {
  default = "latest"
}

group "companion-images" {
  targets = ["kroki-mermaid", "kroki-bpmn", "kroki-excalidraw", "kroki-diagramsnet", "kroki-wireviz"]
}

target "kroki" {
  context = "server"
  contexts = {
    nomnoml = "./nomnoml"
    vega = "./vega"
    dbml = "./dbml"
    wavedrom = "./wavedrom"
    bytefield = "./bytefield"
    tikz = "./tikz"
    kroki-src = "."
  }
  dockerfile = "ops/docker/jdk11-jammy/Dockerfile"
  tags = ["yuzutech/kroki:${TAG}"]
}

target "kroki-mermaid" {
  context = "mermaid"
  tags = ["yuzutech/kroki-mermaid:${TAG}"]
}

target "kroki-bpmn" {
  context = "bpmn"
  tags = ["yuzutech/kroki-bpmn:${TAG}"]
}

target "kroki-excalidraw" {
  context = "excalidraw"
  tags = ["yuzutech/kroki-excalidraw:${TAG}"]
}

target "kroki-diagramsnet" {
  context = "diagrams.net"
  tags = ["yuzutech/kroki-diagramsnet:${TAG}"]
}

target "kroki-wireviz" {
  context = "wireviz"
  tags = ["yuzutech/kroki-wireviz:${TAG}"]
}
