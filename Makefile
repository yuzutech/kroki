MULTI_ARCH_AVAILABLE := $(shell docker buildx inspect | grep amd64 | grep arm64 > /dev/null 2>&1; echo $$?)

SMOKE_TESTS_DIR=tests/smoke
COMPOSE_TIMEOUT=20
SERVICES_TIMEOUT=15

default:

installLocalDependencies:
	mvn install:install-file -Dfile=./umlet/lib/umlet-mini-15.0.0.jar -DgroupId=com.umlet -DartifactId=umlet-mini -Dversion=15.0.0 -Dpackaging=jar
	mvn install:install-file -Dfile=./server/lib/ditaamini-0.14.jar -DgroupId=ditaa -DartifactId=ditaa-mini -Dversion=0.14 -Dpackaging=jar

buildServer:
	mvn --no-transfer-progress clean package

setServerVersion:
ifndef RELEASE_VERSION
	$(error RELEASE_VERSION is undefined)
endif
	mvn versions:set -DnewVersion=$(RELEASE_VERSION)

buildDockerImages:
ifeq ($(MULTI_ARCH_AVAILABLE), 0)
	docker buildx bake --set "*.cache-from=$(CACHE_FROM)" --set "*.cache-to=$(CACHE_TO)" --set "kroki-*.platform=linux/arm64,linux/amd64"
else
	docker buildx bake --set "*.cache-from=$(CACHE_FROM)" --set "*.cache-to=$(CACHE_TO)"
endif

publishDockerImages:
ifndef RELEASE_VERSION
	$(error RELEASE_VERSION is undefined)
endif
	docker buildx bake -f docker-bake.hcl -f docker-bake-release.hcl --push --set "kroki-*.platform=linux/arm64,linux/amd64"

smokeTests:
	TAG=smoketests docker buildx bake --load --set "*.cache-from=$(CACHE_FROM)" --set "*.cache-to=$(CACHE_TO)"
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
