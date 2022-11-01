SMOKE_TESTS_DIR=tests/smoke
COMPOSE_TIMEOUT=20
SERVICES_TIMEOUT=15

# Python is used for blockdiag module and to display examples
PYTHON=python3.11

default:

installLocalDependencies:
	mvn install:install-file -Dfile=./umlet/lib/umlet-mini-14.3.0.jar -DgroupId=com.umlet -DartifactId=umlet-mini -Dversion=14.3.0 -Dpackaging=jar
	mvn install:install-file -Dfile=./server/lib/ditaamini-0.14.jar -DgroupId=ditaa -DartifactId=ditaa-mini -Dversion=0.14 -Dpackaging=jar

buildServer:
	mvn --no-transfer-progress clean package

installBlockDiag:
	cd blockdiag && $(PYTHON) -m pip install -r requirements.txt

testBlockDiag:
	cd blockdiag && $(PYTHON) -m unittest test/test_diag.py

setServerVersion:
ifndef RELEASE_VERSION
	$(error RELEASE_VERSION is undefined)
endif
	mvn versions:set -DnewVersion=$(RELEASE_VERSION)

buildDockerImages:
	$(MAKE) -C nomnoml package
	$(MAKE) -C vega package
	$(MAKE) -C wavedrom package
	$(MAKE) -C bytefield package
	$(MAKE) -C server/ops/docker package
	$(MAKE) -C server package
	$(MAKE) -C blockdiag package
	$(MAKE) -C mermaid package
	$(MAKE) -C bpmn package
	$(MAKE) -C excalidraw package
	$(MAKE) -C diagrams.net package

publishDockerImages:
ifndef RELEASE_VERSION
	$(error RELEASE_VERSION is undefined)
endif
	$(MAKE) -C nomnoml package
	$(MAKE) -C vega package
	$(MAKE) -C wavedrom package
	$(MAKE) -C bytefield package
	$(MAKE) -C server/ops/docker package
	$(MAKE) -C server publish
	$(MAKE) -C blockdiag publish
	$(MAKE) -C mermaid publish
	$(MAKE) -C bpmn publish
	$(MAKE) -C excalidraw publish
	$(MAKE) -C diagrams.net publish

showExamples:
	$(PYTHON) blockdiag/examples.py

smokeTests:
	@docker-compose --file "$(SMOKE_TESTS_DIR)/docker-compose.yaml" up --build --detach \
	&& echo \
	&& docker-compose --file "$(SMOKE_TESTS_DIR)/docker-compose.yaml" ps \
	&& echo \
	&& "$(SMOKE_TESTS_DIR)/wait-for-it.sh" localhost:8000 --timeout="$(COMPOSE_TIMEOUT)" \
	&& echo \
	&& echo 'Waiting for the containers'\'' services to be available... ($(SERVICES_TIMEOUT) seconds)' \
	&& sleep "$(SERVICES_TIMEOUT)" \
	&& npm test \
	&& docker-compose -f "$(SMOKE_TESTS_DIR)/docker-compose.yaml" stop

installJavaScriptDependencies:
	npm i --prefix bpmn
	npm run prestart --prefix bpmn
	npm i --prefix bytefield
	npm i --prefix diagrams.net
	npm i --prefix excalidraw
	npm run prestart --prefix excalidraw
	npm i --prefix mermaid
	npm run prestart --prefix mermaid
	npm i --prefix nomnoml
	npm i --prefix vega
	npm i --prefix wavedrom

