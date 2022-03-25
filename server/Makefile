.PHONY: package publish

build:
	mvn clean package

package:
	docker build -f ops/docker/jdk11-alpine/Dockerfile -t yuzutech/kroki:jdk11-alpine -t yuzutech/kroki:jdk-11 -t yuzutech/kroki:latest .

publish: package
ifndef RELEASE_VERSION
		$(error RELEASE_VERSION is undefined)
endif
	docker tag yuzutech/kroki:latest yuzutech/kroki:$(RELEASE_VERSION)
	docker push yuzutech/kroki:latest
	docker push yuzutech/kroki:$(RELEASE_VERSION)

run:
	docker run yuzutech/kroki:latest
