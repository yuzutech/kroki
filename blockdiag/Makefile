.PHONY: package publish smokeTests

default:

package:
	docker build -t yuzutech/kroki-blockdiag .

publish: package
ifndef RELEASE_VERSION
		$(error RELEASE_VERSION is undefined)
endif
	docker tag yuzutech/kroki-blockdiag:latest yuzutech/kroki-blockdiag:$(RELEASE_VERSION)
	docker push yuzutech/kroki-blockdiag:latest
	docker push yuzutech/kroki-blockdiag:$(RELEASE_VERSION)

smokeTests:
	venv-py38/bin/python -m unittest test/test_diag.py
