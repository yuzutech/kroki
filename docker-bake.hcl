variable "TAG" {
  default = "latest"
}

group "default" {
  targets = ["kroki", "kroki-blockdiag", "kroki-mermaid", "kroki-bpmn", "kroki-excalidraw", "kroki-diagramsnet"]
}

target "kroki" {
  context = "server"
  contexts = {
    nomnoml = "./nomnoml"
    vega = "./vega"
    dbml = "./dbml"
    wavedrom = "./wavedrom"
    bytefield = "./bytefield"
  }
  dockerfile = "ops/docker/jdk11-alpine/Dockerfile"
  tags = ["yuzutech/kroki:${TAG}"]
}

target "kroki-blockdiag" {
  context = "blockdiag"
  tags = ["yuzutech/kroki-blockdiag:${TAG}"]
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

