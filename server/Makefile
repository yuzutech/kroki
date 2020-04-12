build:
	mvn clean package

package:
	docker build -f ops/docker/jdk11-alpine/Dockerfile -t yuzutech/kroki:jdk11-alpine -t yuzutech/kroki:jdk-11 -t yuzutech/kroki:latest .

run:
	docker run yuzutech/kroki:latest
