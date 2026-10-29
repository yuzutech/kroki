# syntax=docker/dockerfile:1.28
# UMLet compiled to a native binary with GraalVM (so the Kroki image does not need a JVM to run it),
# published as ghcr.io/yuzutech/kroki-builder-umlet by the "Tool images" workflow.
# Built from the upstream release sources (https://github.com/umlet/umlet) with a command line interface,
# UmletCli.java, that reads a diagram from stdin and writes the converted diagram to stdout.
# renovate: datasource=github-tags depName=umlet/umlet extractVersion=^v(?<version>\d+\.\d+(\.\d+)?)$
ARG VERSION=15.1

FROM maven:3.9-eclipse-temurin-11 AS jar
ARG VERSION
ADD --keep-git-dir=false "https://github.com/umlet/umlet.git#v${VERSION}" /build
WORKDIR /build
# The compilation does not find the parsers that JavaCC generates in target/generated-sources/annotations
# (the default location, shared with annotation processing): generate them in a dedicated directory
RUN mvn --batch-mode --quiet install -DskipTests --projects umlet-swing --also-make \
      -Djavacc.gen.dir=target/generated-sources/javacc && \
    mvn --batch-mode --quiet dependency:copy-dependencies --projects umlet-swing \
      -DincludeScope=runtime -DoutputDirectory=/build/libs && \
    cp "umlet-swing/target/umlet-swing-${VERSION}.jar" /build/libs/

# The binary runs on any glibc at least as recent as Oracle Linux 9's (2.34)
FROM ghcr.io/graalvm/native-image-community:25.0.2-ol9 AS build
# AWT (used to measure and render text) loads fonts with FreeType and Fontconfig
RUN microdnf install --assumeyes --nodocs freetype fontconfig dejavu-sans-fonts && \
    microdnf clean all
WORKDIR /build
COPY --from=jar /build/libs /build/libs
# Diagrams with every UMLet element, used to record the native image configuration and to test the binary
COPY --from=jar /build/umlet-res/src/main/resources/palettes /build/fixtures
COPY UmletCli.java /build/src/
RUN javac -cp "libs/*" -d classes src/UmletCli.java
# Elements of the old format (still used by many diagrams) are loaded by name (see com.baselet.diagram.io.InputHandler):
# register every class of their packages, the diagrams above only use some of them
RUN mkdir element-config && \
    classes=$(jar --list --file libs/umlet-swing-*.jar | \
      grep -E '^com/baselet/element/old/(element|allinone|custom)/[^/$]+\.class$' | \
      sed -E 's|\.class$||; s|/|.|g; s|.*|{"type": "&", "methods": [{"name": "<init>", "parameterTypes": []}]}|' | paste -sd,) && \
    echo "{\"reflection\": [$classes]}" > element-config/reachability-metadata.json
# Record the reflection/resources configuration by running every code path used by Kroki
# (SVG, PNG and JPEG outputs, invalid XML), then compile the native binary
RUN mkdir -p /opt/umlet/lib native-image-config && \
    for fixture in fixtures/*.uxf; do \
      for format in svg png jpeg; do \
        java -Djava.awt.headless=true -agentlib:native-image-agent=config-merge-dir=native-image-config \
          -cp "classes:libs/*" UmletCli $format < "$fixture" > /dev/null || exit 1; \
      done; \
    done && \
    { echo "<diagram" | java -Djava.awt.headless=true -agentlib:native-image-agent=config-merge-dir=native-image-config \
        -cp "classes:libs/*" UmletCli svg > /dev/null 2>&1 || true; } && \
    native-image -Djava.awt.headless=true -H:ConfigurationFileDirectories=native-image-config,element-config --no-fallback \
      -cp "classes:libs/*" UmletCli -o /opt/umlet/umlet

# Run the binary on the same base image as Kroki, the way Kroki calls it
# (the AWT font manager needs FreeType and Fontconfig, both installed in the Kroki image)
FROM ubuntu:noble AS test
RUN apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -qq --no-install-recommends --yes \
    fontconfig \
    fonts-dejavu-core \
    libfreetype6 > /dev/null && \
    apt-get clean && apt-get autoremove -qq > /dev/null
COPY --from=build /opt/umlet /opt/umlet
RUN ln -s /opt/umlet/umlet /usr/bin/umlet
COPY --from=build /build/fixtures /tmp/fixtures
# Diagrams in the old format, not used to record the configuration, to check that every old element is registered
COPY fixtures /tmp/fixtures
RUN for fixture in /tmp/fixtures/*.uxf; do \
      for format in svg png jpeg; do \
        umlet $format < "$fixture" > "/tmp/diagram.$format" && test -s "/tmp/diagram.$format" || exit 1; \
      done; \
      grep -q "<svg" /tmp/diagram.svg || exit 1; \
      if grep -q "This Element has an Error" /tmp/diagram.svg; then echo "Element error in $fixture" && exit 1; fi; \
    done && \
    if echo "<diagram" | umlet svg 2> /tmp/error.txt; then echo "Invalid XML must fail" && exit 1; fi && \
    test -s /tmp/error.txt && \
    cp -r /opt/umlet /tmp/relocated && \
    DISPLAY=:0 /tmp/relocated/umlet svg < /tmp/fixtures/old-state-machine.uxf > /tmp/relocated.svg && grep -q "<svg" /tmp/relocated.svg

# The binary loads the AWT shared libraries generated next to it
FROM scratch
COPY --from=build /opt/umlet /opt/umlet
