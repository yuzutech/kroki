default:

installLocalDependencies:
	mvn install:install-file -Dfile=./umlet/lib/umlet-mini-14.3.0.jar -DgroupId=com.umlet -DartifactId=umlet-mini -Dversion=14.3.0 -Dpackaging=jar
	mvn install:install-file -Dfile=./server/lib/ditaa-1.3.13.jar -DgroupId=ditaa -DartifactId=ditaa -Dversion=1.3.13 -Dpackaging=jar
	mvn install:install-file -Dfile=./server/lib/ditaamini-0.11.jar -DgroupId=ditaa -DartifactId=ditaa-mini -Dversion=0.11 -Dpackaging=jar

buildServer:
	mvn clean package

buildDockerImages:
	docker build -t kroki-builder-nomnoml nomnoml
	docker build -f server/ops/docker/build-static-erd -t kroki-builder-static-erd .
	docker build -f server/ops/docker/build-static-svgbob -t kroki-builder-static-svgbob .
	docker build -t yuzutech/kroki server
	docker build -t yuzutech/kroki-blockdiag blockdiag

tagDockerImages:
	docker tag kroki-builder-static-erd:latest kroki-builder-static-erd:0.1.3.0
	docker tag kroki-builder-static-svgbob:latest kroki-builder-static-svgbob:0.4.1
	docker tag kroki-builder-nomnoml:latest kroki-builder-nomnoml:0.3.0

showExamples:
	python blockdiag/examples.py
