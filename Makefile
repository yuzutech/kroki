TESTS_DIR=ci/tests
COMPOSE_TIMEOUT=20
SERVICES_TIMEOUT=15

default:

buildServer:
	./mvnw --no-transfer-progress clean package

setServerVersion:
ifndef RELEASE_VERSION
	$(error RELEASE_VERSION is undefined)
endif
	./mvnw versions:set -DnewVersion=$(RELEASE_VERSION)

buildDockerImages:
ifdef BUILD_MULTIARCH
	docker buildx bake kroki companion-images --set "*.cache-from=$(CACHE_FROM)" --set "*.cache-to=$(CACHE_TO)" --set "*.platform=linux/arm64,linux/amd64"
else
	docker buildx bake kroki companion-images --set "*.cache-from=$(CACHE_FROM)" --set "*.cache-to=$(CACHE_TO)"
endif

publishDockerImages:
ifndef RELEASE_VERSION
	$(error RELEASE_VERSION is undefined)
endif
	docker buildx bake -f docker-bake.hcl -f docker-bake-release.hcl kroki companion-images --push --set "*.platform=linux/arm64,linux/amd64"

smokeTests:
	TAG=smoketests docker buildx bake kroki companion-images --load --set "*.cache-from=$(CACHE_FROM)" --set "*.cache-to=$(CACHE_TO)"
	@docker compose --file "$(TESTS_DIR)/docker-compose.yaml" up --build --detach \
	&& echo \
	&& docker compose --file "$(TESTS_DIR)/docker-compose.yaml" ps \
	&& echo \
	&& "$(TESTS_DIR)/wait-for-it.sh" localhost:8000 --timeout="$(COMPOSE_TIMEOUT)" \
	&& echo \
	&& echo 'Waiting for the containers'\'' services to be available... ($(SERVICES_TIMEOUT) seconds)' \
	&& sleep "$(SERVICES_TIMEOUT)" \
	&& npm test \
	&& docker compose -f "$(TESTS_DIR)/docker-compose.yaml" stop

installJavaScriptDependencies:
	npm i --prefix bpmn
	npm run prestart --prefix bpmn
	npm i --prefix bytefield
	npm i --prefix dbml
	npm i --prefix diagrams.net
	npm i --prefix excalidraw
	npm run prestart --prefix excalidraw
	npm i --prefix mermaid
	npm run prestart --prefix mermaid
	npm i --prefix nomnoml
	npm i --prefix vega
	npm i --prefix wavedrom
