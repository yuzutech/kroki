variable "TAG" {
  default = "latest"
}

# Each target must use its own cache directory: concurrent cache exports
# to the same local directory race in the ingest area and fail with
# "error writing layer blob: rename tmp file ... no such file or directory".
variable "CACHE_FROM_DIR" {
  default = ""
}

variable "CACHE_TO_DIR" {
  default = ""
}

group "companion-images" {
  targets = ["kroki-mermaid", "kroki-bpmn", "kroki-excalidraw", "kroki-diagramsnet"]
}

target "oci-labels" {
  labels = {
    "org.opencontainers.image.description" = "Kroki provides a unified API supporting multiple diagramming formats, making it easy to create diagrams from textual descriptions."
    "org.opencontainers.image.url" = "https://kroki.io"
    "org.opencontainers.image.source" = "https://github.com/yuzutech/kroki"
    "org.opencontainers.image.licenses" = "MIT"
  }
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
  }
  dockerfile = "ops/docker/Dockerfile"
  tags = ["yuzutech/kroki:${TAG}"]
  cache-from = CACHE_FROM_DIR != "" ? ["type=local,src=${CACHE_FROM_DIR}/kroki"] : []
  cache-to = CACHE_TO_DIR != "" ? ["type=local,dest=${CACHE_TO_DIR}/kroki"] : []
  inherits = ["oci-labels"]
  labels = {
    "org.opencontainers.image.title" = "Kroki"
  }
}

target "kroki-mermaid" {
  context = "mermaid"
  contexts = {
    lib = "./lib/browser-instance"
  }
  tags = ["yuzutech/kroki-mermaid:${TAG}"]
  cache-from = CACHE_FROM_DIR != "" ? ["type=local,src=${CACHE_FROM_DIR}/mermaid"] : []
  cache-to = CACHE_TO_DIR != "" ? ["type=local,dest=${CACHE_TO_DIR}/mermaid"] : []
  inherits = ["oci-labels"]
  labels = {
    "org.opencontainers.image.title" = "Kroki - Mermaid"
  }
}

target "kroki-bpmn" {
  context = "bpmn"
  contexts = {
    lib = "./lib/browser-instance"
  }
  tags = ["yuzutech/kroki-bpmn:${TAG}"]
  cache-from = CACHE_FROM_DIR != "" ? ["type=local,src=${CACHE_FROM_DIR}/bpmn"] : []
  cache-to = CACHE_TO_DIR != "" ? ["type=local,dest=${CACHE_TO_DIR}/bpmn"] : []
  inherits = ["oci-labels"]
  labels = {
    "org.opencontainers.image.title" = "Kroki - BPMN"
  }
}

target "kroki-excalidraw" {
  context = "excalidraw"
  contexts = {
    lib = "./lib/browser-instance"
  }
  tags = ["yuzutech/kroki-excalidraw:${TAG}"]
  cache-from = CACHE_FROM_DIR != "" ? ["type=local,src=${CACHE_FROM_DIR}/excalidraw"] : []
  cache-to = CACHE_TO_DIR != "" ? ["type=local,dest=${CACHE_TO_DIR}/excalidraw"] : []
  inherits = ["oci-labels"]
  labels = {
    "org.opencontainers.image.title" = "Kroki - Excalidraw"
  }
}

target "kroki-diagramsnet" {
  context = "diagrams.net"
  contexts = {
    lib = "./lib/browser-instance"
  }
  tags = ["yuzutech/kroki-diagramsnet:${TAG}"]
  cache-from = CACHE_FROM_DIR != "" ? ["type=local,src=${CACHE_FROM_DIR}/diagramsnet"] : []
  cache-to = CACHE_TO_DIR != "" ? ["type=local,dest=${CACHE_TO_DIR}/diagramsnet"] : []
  inherits = ["oci-labels"]
  labels = {
    "org.opencontainers.image.title" = "Kroki - diagrams.net"
  }
}
