LATEST_VERSION = 0.0.12

SMOKE_TESTS_DIR=tests/smoke
COMPOSE_TIMEOUT=20
SERVICES_TIMEOUT=15

default:

installLocalDependencies:
	mvn install:install-file -Dfile=./umlet/lib/umlet-mini-14.3.0.jar -DgroupId=com.umlet -DartifactId=umlet-mini -Dversion=14.3.0 -Dpackaging=jar
	mvn install:install-file -Dfile=./server/lib/ditaa-1.3.13.jar -DgroupId=ditaa -DartifactId=ditaa -Dversion=1.3.13 -Dpackaging=jar
	mvn install:install-file -Dfile=./server/lib/ditaamini-0.11.jar -DgroupId=ditaa -DartifactId=ditaa-mini -Dversion=0.11 -Dpackaging=jar

buildServer:
	mvn clean package

buildDockerImages:
	cd nomnoml && $(MAKE) package
	cd vega && $(MAKE) package
	docker build -f server/ops/docker/build-static-erd -t kroki-builder-static-erd .
	docker build -f server/ops/docker/build-static-svgbob -t kroki-builder-static-svgbob .
	cd server && $(MAKE) package
	cd blockdiag && $(MAKE) package
	cd mermaid && $(MAKE) package

tagDockerImages:
	docker tag kroki-builder-static-erd:latest kroki-builder-static-erd:0.2.0.0
	docker tag kroki-builder-static-svgbob:latest kroki-builder-static-svgbob:0.4.2
	docker tag kroki-builder-nomnoml:latest kroki-builder-nomnoml:0.6.1
	docker tag kroki-builder-vega:latest kroki-builder-vega:5.9.1

showExamples:
	python blockdiag/examples.py

releaseDockerImages:
	docker tag yuzutech/kroki:latest yuzutech/kroki:$(LATEST_VERSION)
	docker tag yuzutech/kroki-blockdiag:latest yuzutech/kroki-blockdiag:$(LATEST_VERSION)
	docker tag yuzutech/kroki-mermaid:latest yuzutech/kroki-mermaid:$(LATEST_VERSION)
	docker tag yuzutech/kroki:latest yuzutech/kroki:latest
	docker tag yuzutech/kroki-blockdiag:latest yuzutech/kroki-blockdiag:latest
	docker tag yuzutech/kroki-mermaid:latest yuzutech/kroki-mermaid:latest

pushDockerImages:
	docker push yuzutech/kroki:latest
	docker push yuzutech/kroki-blockdiag:latest
	docker push yuzutech/kroki-mermaid:latest
	docker push yuzutech/kroki:$(LATEST_VERSION)
	docker push yuzutech/kroki-blockdiag:$(LATEST_VERSION)
	docker push yuzutech/kroki-mermaid:$(LATEST_VERSION)

smokeTests:
	@docker-compose --file "$(SMOKE_TESTS_DIR)/docker-compose.yaml" up --build --detach \
	&& echo \
	&& docker-compose --file "$(SMOKE_TESTS_DIR)/docker-compose.yaml" ps \
	&& echo \
	&& "$(SMOKE_TESTS_DIR)/wait-for-it.sh" localhost:8000 --timeout="$(COMPOSE_TIMEOUT)" \
	&& "$(SMOKE_TESTS_DIR)/wait-for-it.sh" localhost:8001 --timeout="$(COMPOSE_TIMEOUT)" \
	&& "$(SMOKE_TESTS_DIR)/wait-for-it.sh" localhost:8002 --timeout="$(COMPOSE_TIMEOUT)" \
	&& echo \
	&& echo 'Waiting for the containers'\'' services to be available... ($(SERVICES_TIMEOUT) seconds)' \
	&& sleep "$(SERVICES_TIMEOUT)" \
	&& npm test \
	&& docker-compose -f "$(SMOKE_TESTS_DIR)/docker-compose.yaml" stop

