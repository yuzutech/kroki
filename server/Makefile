BUILDX_AVAILABLE := $(shell docker buildx inspect | grep -i -e running -e amd64 > /dev/null 2>&1; echo $$?)

.PHONY: package publish run

ifdef CI
CACHE_OPS = --cache-from $(CACHE_FROM) --cache-to $(CACHE_TO)
endif

build:
	mvn clean package

package:
ifeq ($(BUILDX_AVAILABLE), 0)
	docker buildx build -f ops/docker/jdk11-alpine/Dockerfile \
	                    -t yuzutech/kroki:jdk11-alpine \
	                    -t yuzutech/kroki:jdk-11 \
	                    -t yuzutech/kroki:latest \
	                    --build-context=nomnoml=../nomnoml \
	                    --build-context=vega=../vega \
	                    --build-context=wavedrom=../wavedrom \
	                    --build-context=bytefield=../bytefield \
	                    --load $(CACHE_OPS) .
else
	docker build -f ops/docker/jdk11-alpine/Dockerfile -t yuzutech/kroki:jdk11-alpine -t yuzutech/kroki:jdk-11 -t yuzutech/kroki:latest .
endif

publish: package
ifndef RELEASE_VERSION
	$(error RELEASE_VERSION is undefined)
endif
	docker tag yuzutech/kroki:latest yuzutech/kroki:$(RELEASE_VERSION)
	docker push yuzutech/kroki:latest
	docker push yuzutech/kroki:$(RELEASE_VERSION)

run:
	docker run yuzutech/kroki:latest
