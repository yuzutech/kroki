build:
	mvn clean package

package:
	docker build -f ops/docker/jdk8-alpine/Dockerfile -t yuzutech/kroki:jdk8-alpine -t yuzutech/kroki:latest .
#	docker build -f ops/docker/jdk11-alpine/Dockerfile -t yuzutech/kroki:jdk11-alpine .
#	docker build -f ops/docker/jdk11-slim-stretch/Dockerfile -t yuzutech/kroki:jdk11-slim-stretch .

run:
	docker run yuzutech/kroki:latest
