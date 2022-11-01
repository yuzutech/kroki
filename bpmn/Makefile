MULTI_ARCH_AVAILABLE := $(shell docker buildx inspect | grep amd64 | grep arm64 > /dev/null 2>&1; echo $$?)
BUILDX_AVAILABLE := $(shell docker buildx inspect | grep -i -e running -e amd64 > /dev/null 2>&1; echo $$?)

.PHONY: package publish dist

ifdef CI
CACHE_OPS = --cache-from $(CACHE_FROM) --cache-to $(CACHE_TO)
endif

default: package

package:
ifeq ($(MULTI_ARCH_AVAILABLE), 0)
	docker buildx build -o type="image,push=false" --platform linux/amd64,linux/arm64 --tag yuzutech/kroki-bpmn:latest $(CACHE_OPS) .
else ifeq ($(BUILDX_AVAILABLE), 0)
	docker buildx build -o type="image,push=false" --tag yuzutech/kroki-bpmn:latest $(CACHE_OPS) .
else
	docker build -t yuzutech/kroki-bpmn .
endif

publish:
ifndef RELEASE_VERSION
	$(error RELEASE_VERSION is undefined)
endif
	docker buildx build --push --platform linux/amd64,linux/arm64 --tag yuzutech/kroki-bpmn:latest --tag yuzutech/kroki-bpmn:${RELEASE_VERSION} $(CACHE_OPS} .
