variable "RELEASE_VERSION" {
}

# The release workflow builds each platform on its own native runner and pushes
# the images untagged, by digest (push-by-digest refuses tagged references);
# a final job then merges the per-platform digests into tagged multi-platform images.
variable "PUSH_BY_DIGEST" {
  type = bool
  default = false
}

function "release_tags" {
  params = [repository]
  result = PUSH_BY_DIGEST ? [] : ["${repository}:${RELEASE_VERSION}", "${repository}:latest"]
}

function "release_output" {
  params = [repository]
  result = PUSH_BY_DIGEST ? ["type=image,name=${repository},push-by-digest=true,name-canonical=true,push=true"] : []
}

target "kroki" {
  tags = release_tags("yuzutech/kroki")
  output = release_output("yuzutech/kroki")
}

target "kroki-mermaid" {
  tags = release_tags("yuzutech/kroki-mermaid")
  output = release_output("yuzutech/kroki-mermaid")
}

target "kroki-bpmn" {
  tags = release_tags("yuzutech/kroki-bpmn")
  output = release_output("yuzutech/kroki-bpmn")
}

target "kroki-excalidraw" {
  tags = release_tags("yuzutech/kroki-excalidraw")
  output = release_output("yuzutech/kroki-excalidraw")
}

target "kroki-diagramsnet" {
  tags = release_tags("yuzutech/kroki-diagramsnet")
  output = release_output("yuzutech/kroki-diagramsnet")
}
