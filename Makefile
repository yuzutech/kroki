LATEST_VERSION = 0.11.0

SMOKE_TESTS_DIR=tests/smoke
COMPOSE_TIMEOUT=20
SERVICES_TIMEOUT=15

default:

installLocalDependencies:
	mvn install:install-file -Dfile=./umlet/lib/umlet-mini-14.3.0.jar -DgroupId=com.umlet -DartifactId=umlet-mini -Dversion=14.3.0 -Dpackaging=jar
	mvn install:install-file -Dfile=./server/lib/ditaamini-0.14.jar -DgroupId=ditaa -DartifactId=ditaa-mini -Dversion=0.14 -Dpackaging=jar

buildServer:
	mvn clean package

# requires Python 3.8 in the $PATH
installBlockDiag:
	cd blockdiag && pip3.8 install -r requirements.txt

testBlockDiag:
	cd blockdiag && python3.8 -m unittest test/test_diag.py

setServerVersion:
	mvn versions:set -DnewVersion=$(LATEST_VERSION)

buildDockerImages:
	cd nomnoml && $(MAKE) package
	cd vega && $(MAKE) package
	cd wavedrom && $(MAKE) package
	cd bytefield && $(MAKE) package
	docker build -f server/ops/docker/build-static-erd -t kroki-builder-static-erd .
	docker build -f server/ops/docker/build-static-svgbob -t kroki-builder-static-svgbob .
	cd server && $(MAKE) package
	cd blockdiag && $(MAKE) package
	cd mermaid && $(MAKE) package
	cd bpmn && $(MAKE) package
	cd excalidraw && $(MAKE) package

showExamples:
	python blockdiag/examples.py

releaseDockerImages:
	docker tag yuzutech/kroki:latest yuzutech/kroki:$(LATEST_VERSION)
	docker tag yuzutech/kroki-blockdiag:latest yuzutech/kroki-blockdiag:$(LATEST_VERSION)
	docker tag yuzutech/kroki-mermaid:latest yuzutech/kroki-mermaid:$(LATEST_VERSION)
	docker tag yuzutech/kroki-excalidraw:latest yuzutech/kroki-excalidraw:$(LATEST_VERSION)
	docker tag yuzutech/kroki-bpmn:latest yuzutech/kroki-bpmn:$(LATEST_VERSION)
	docker tag yuzutech/kroki:latest yuzutech/kroki:latest
	docker tag yuzutech/kroki-blockdiag:latest yuzutech/kroki-blockdiag:latest
	docker tag yuzutech/kroki-mermaid:latest yuzutech/kroki-mermaid:latest
	docker tag yuzutech/kroki-excalidraw:latest yuzutech/kroki-excalidraw:latest
	docker tag yuzutech/kroki-bpmn:latest yuzutech/kroki-bpmn:latest

pushDockerImages:
	docker push yuzutech/kroki:latest
	docker push yuzutech/kroki-blockdiag:latest
	docker push yuzutech/kroki-mermaid:latest
	docker push yuzutech/kroki-excalidraw:latest
	docker push yuzutech/kroki-bpmn:latest
	docker push yuzutech/kroki:$(LATEST_VERSION)
	docker push yuzutech/kroki-blockdiag:$(LATEST_VERSION)
	docker push yuzutech/kroki-mermaid:$(LATEST_VERSION)
	docker push yuzutech/kroki-excalidraw:$(LATEST_VERSION)
	docker push yuzutech/kroki-bpmn:$(LATEST_VERSION)

smokeTests:
	@docker-compose --file "$(SMOKE_TESTS_DIR)/docker-compose.yaml" up --build --detach \
	&& echo \
	&& docker-compose --file "$(SMOKE_TESTS_DIR)/docker-compose.yaml" ps \
	&& echo \
	&& "$(SMOKE_TESTS_DIR)/wait-for-it.sh" localhost:8000 --timeout="$(COMPOSE_TIMEOUT)" \
	&& "$(SMOKE_TESTS_DIR)/wait-for-it.sh" localhost:8001 --timeout="$(COMPOSE_TIMEOUT)" \
	&& "$(SMOKE_TESTS_DIR)/wait-for-it.sh" localhost:8002 --timeout="$(COMPOSE_TIMEOUT)" \
	&& "$(SMOKE_TESTS_DIR)/wait-for-it.sh" localhost:8003 --timeout="$(COMPOSE_TIMEOUT)" \
	&& "$(SMOKE_TESTS_DIR)/wait-for-it.sh" localhost:8004 --timeout="$(COMPOSE_TIMEOUT)" \
	&& echo \
	&& echo 'Waiting for the containers'\'' services to be available... ($(SERVICES_TIMEOUT) seconds)' \
	&& sleep "$(SERVICES_TIMEOUT)" \
	&& npm test \
	&& docker-compose -f "$(SMOKE_TESTS_DIR)/docker-compose.yaml" stop

installJavaScriptDependencies:
	npm i --prefix bpmn
	npm run prestart --prefix bpmn
	npm i --prefix bytefield
	npm i --prefix excalidraw
	npm run prestart --prefix excalidraw
	npm i --prefix mermaid
	npm run prestart --prefix mermaid
	npm i --prefix nomnoml
	npm i --prefix vega
	npm i --prefix wavedrom

