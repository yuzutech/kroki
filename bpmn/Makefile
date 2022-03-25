MULTI_ARCH_AVAILABLE := $(shell docker buildx inspect | grep amd64 | grep arm64 > /dev/null 2>&1; echo $$?)

.PHONY: package publish dist

default: package

package:
ifeq ($(MULTI_ARCH_AVAILABLE), 0)
	docker buildx build -o type="image,push=false" --platform linux/amd64,linux/arm64 --tag yuzutech/kroki-bpmn:latest .
else
	docker build -t yuzutech/kroki-bpmn .
endif

publish:
ifndef RELEASE_VERSION
	$(error RELEASE_VERSION is undefined)
endif
	docker buildx build --push --platform linux/amd64,linux/arm64 --tag yuzutech/kroki-bpmn:latest --tag yuzutech/kroki-bpmn:${RELEASE_VERSION} .
