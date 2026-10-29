variable "TAG" {
  default = "latest"
}

# Local development: a local cache directory, with one subdirectory per target.
# Each target must use its own cache directory: concurrent cache exports
# to the same local directory race in the ingest area and fail with
# "error writing layer blob: rename tmp file ... no such file or directory".
variable "CACHE_FROM_DIR" {
  default = ""
}

variable "CACHE_TO_DIR" {
  default = ""
}

# CI: the GitHub Actions cache, with one scope per target (and per architecture, see GHA_CACHE_SCOPE).
# BuildKit reads the cache API URL and token from the ACTIONS_RESULTS_URL and ACTIONS_RUNTIME_TOKEN
# environment variables, see the "Expose the GitHub Actions cache API" step of the CI workflow.
variable "GHA_CACHE_SCOPE" {
  default = ""
}

variable "GHA_CACHE_WRITE" {
  type = bool
  default = false
}

# mode=max also exports the layers of the intermediate stages (kroki-builder-*),
# otherwise any change in the final stage rebuilds them from scratch.
# ignore-error: a failed cache export (for instance when the cache API throttles the requests) must not fail the build.
function "cache_from" {
  params = [name]
  result = concat(
    CACHE_FROM_DIR != "" ? ["type=local,src=${CACHE_FROM_DIR}/${name}"] : [],
    GHA_CACHE_SCOPE != "" ? ["type=gha,version=2,scope=${GHA_CACHE_SCOPE}-${name}"] : [],
  )
}

function "cache_to" {
  params = [name]
  result = concat(
    CACHE_TO_DIR != "" ? ["type=local,dest=${CACHE_TO_DIR}/${name},mode=max"] : [],
    GHA_CACHE_SCOPE != "" && GHA_CACHE_WRITE ? ["type=gha,version=2,scope=${GHA_CACHE_SCOPE}-${name},mode=max,ignore-error=true"] : [],
  )
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
  cache-from = cache_from("kroki")
  cache-to = cache_to("kroki")
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
  cache-from = cache_from("mermaid")
  cache-to = cache_to("mermaid")
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
  cache-from = cache_from("bpmn")
  cache-to = cache_to("bpmn")
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
  cache-from = cache_from("excalidraw")
  cache-to = cache_to("excalidraw")
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
  cache-from = cache_from("diagramsnet")
  cache-to = cache_to("diagramsnet")
  inherits = ["oci-labels"]
  labels = {
    "org.opencontainers.image.title" = "Kroki - diagrams.net"
  }
}
