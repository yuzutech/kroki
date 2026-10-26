# syntax=docker/dockerfile:1.28
# UMLet compiled to a native binary with GraalVM (so the Kroki image does not need a JVM to run it),
# published as ghcr.io/yuzutech/kroki-builder-umlet by the "Tool images" workflow.
# Built from the "mini" branch of the yuzutech/umlet fork, which strips UMLet down to its rendering engine
# and adds a command line interface (umlet-cli) that reads from stdin and writes to stdout.
# The fork has no release tags: VERSION is the UMLet version and REVISION the commit of the "mini" branch it is built from.
ARG VERSION=15.1
ARG REVISION=70ae1b33d24dc58cbc849cdbaf5048911efbfdaa

FROM maven:3.9-eclipse-temurin-11 AS jar
ARG REVISION
ADD --keep-git-dir=false "https://github.com/yuzutech/umlet.git#${REVISION}" /build
WORKDIR /build
# The compilation does not find the parsers that JavaCC generates in target/generated-sources/annotations
# (the default location, shared with annotation processing): generate them in a dedicated directory
RUN mvn --batch-mode --quiet package -DskipTests --projects umlet-cli --also-make \
      -Djavacc.gen.dir=target/generated-sources/javacc

# The binary runs on any glibc at least as recent as Oracle Linux 9's (2.34)
FROM ghcr.io/graalvm/native-image-community:25.0.2-ol9 AS build
# AWT (used to measure and render text) loads fonts with FreeType and Fontconfig
RUN microdnf install --assumeyes --nodocs freetype fontconfig dejavu-sans-fonts && \
    microdnf clean all
WORKDIR /build
COPY --from=jar /build/umlet-cli/target/umlet.jar /build/umlet.jar
COPY --from=jar /build/umlet-cli/fixtures /build/fixtures
# AWT looks for an optional font configuration file in ${java.home}/lib, which a native image does not set,
# and only falls back to Fontconfig when this directory exists (see sun.awt.FontConfiguration#findFontConfigFile)
COPY <<EOF /build/src/NativeLauncher.java
public class NativeLauncher {
  public static void main(String[] args) throws Exception {
    if (System.getProperty("java.home") == null) {
      System.setProperty("java.home", "/opt/umlet");
    }
    io.kroki.umlet.UmletCli.main(args);
  }
}
EOF
RUN javac -cp umlet.jar -d classes src/NativeLauncher.java && \
    jar --update --file umlet.jar --main-class NativeLauncher -C classes .
# Record the reflection/resources configuration by running every code path used by Kroki (SVG, PNG and JPEG outputs)
RUN mkdir -p /opt/umlet/lib native-image-config && \
    for fixture in fixtures/*.xml; do \
      for format in svg png jpeg; do \
        java -Djava.awt.headless=true -agentlib:native-image-agent=config-merge-dir=native-image-config -jar umlet.jar $format < "$fixture" > /dev/null || exit 1; \
      done; \
    done && \
    native-image -Djava.awt.headless=true -H:ConfigurationFileDirectories=native-image-config --no-fallback -jar umlet.jar -o /opt/umlet/umlet

# Run the binary on the same base image as Kroki, the way Kroki calls it
# (the AWT font manager needs FreeType and Fontconfig, both installed in the Kroki image)
FROM ubuntu:noble AS test
RUN apt-get update && apt-get install --no-install-recommends --yes \
    fontconfig \
    fonts-dejavu-core \
    libfreetype6 && \
    apt-get clean && apt-get autoremove
COPY --from=build /opt/umlet /opt/umlet
RUN ln -s /opt/umlet/umlet /usr/bin/umlet
COPY --from=build /build/fixtures /tmp/fixtures
RUN for fixture in /tmp/fixtures/*.xml; do \
      for format in svg png jpeg; do \
        umlet $format < "$fixture" > "/tmp/diagram.$format" && test -s "/tmp/diagram.$format" || exit 1; \
      done; \
    done && \
    grep -q "<svg" /tmp/diagram.svg

# The binary loads the AWT shared libraries generated next to it
FROM scratch
COPY --from=build /opt/umlet /opt/umlet
