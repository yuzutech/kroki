build:
	mvn clean package

package:
	docker build -f ops/docker/jdk11-alpine/Dockerfile -t yuzutech/kroki:jdk11-alpine -t yuzutech/kroki:jdk-11 -t yuzutech/kroki:latest .

buildStaticBinaries:
	docker build -f ops/docker/build-static-erd -t kroki-builder-static-erd .
	docker build -f ops/docker/build-static-svgbob -t kroki-builder-static-svgbob .
	docker build -f ops/docker/build-static-pikchr -t kroki-builder-static-pikchr .

run:
	docker run yuzutech/kroki:latest
