BUILDX_AVAILABLE := $(shell docker buildx inspect | grep -i -e running -e amd64 > /dev/null 2>&1; echo $$?)

.PHONY: package publish smokeTests

ifdef CI
CACHE_OPS = --cache-from $(CACHE_FROM) --cache-to $(CACHE_TO)
endif

default: package

package:
ifeq ($(BUILDX_AVAILABLE), 0)
	docker buildx build -o type="image,push=false" --tag yuzutech/kroki-blockdiag:latest $(CACHE_OPS) .
else
	docker build -t yuzutech/kroki-blockdiag .
endif

publish:
ifndef RELEASE_VERSION
	$(error RELEASE_VERSION is undefined)
endif
	docker tag yuzutech/kroki-blockdiag:latest yuzutech/kroki-blockdiag:$(RELEASE_VERSION)
	docker push yuzutech/kroki-blockdiag:latest
	docker push yuzutech/kroki-blockdiag:$(RELEASE_VERSION)

smokeTests:
	python -m unittest test/test_diag.py
