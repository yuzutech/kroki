# syntax=docker/dockerfile:1.28
# ditaa compiled to a native binary with GraalVM (so the Kroki image does not need a JVM to run it),
# published as ghcr.io/yuzutech/kroki-builder-ditaa by the "Tool images" workflow.
# Built from the "mini" releases of https://github.com/pepijnve/ditaa, a maintained fork of the unmaintained
# https://github.com/stathissideris/ditaa (the yuzutech/ditaa-mini fork only added a workflow to build native images).
# renovate: datasource=github-tags depName=pepijnve/ditaa extractVersion=^mini-(?<version>.+)$
ARG VERSION=1.0.3

# The binary runs on any glibc at least as recent as Oracle Linux 9's (2.34)
FROM ghcr.io/graalvm/native-image-community:25.0.2-ol9 AS build
ARG VERSION
# AWT (used to measure and render text) loads fonts with FreeType and Fontconfig
RUN microdnf install --assumeyes --nodocs freetype fontconfig dejavu-sans-fonts && \
    microdnf clean all
ADD --keep-git-dir=false "https://github.com/pepijnve/ditaa.git#mini-${VERSION}" /build
WORKDIR /build
# AWT looks for an optional font configuration file in ${java.home}/lib, which a native image does not set,
# and only falls back to Fontconfig when this directory exists (see sun.awt.FontConfiguration#findFontConfigFile)
COPY <<EOF /build/src/main/java/NativeLauncher.java
public class NativeLauncher {
  public static void main(String[] args) throws Exception {
    if (System.getProperty("java.home") == null) {
      System.setProperty("java.home", "/opt/ditaa");
    }
    org.stathissideris.ditaa.core.CommandLineConverter.main(args);
  }
}
EOF
# The project has no dependencies: compile it directly rather than with its (outdated) Gradle build
# (ProcessingOptions imports, without using it, a class from a JDK internal package)
RUN javac -nowarn -encoding UTF-8 --add-exports java.xml/com.sun.org.apache.xpath.internal.objects=ALL-UNNAMED \
      -d classes $(find src/main/java -name '*.java') && \
    jar --create --file ditaa.jar --main-class NativeLauncher -C classes .
# Record the reflection/resources configuration by running every code path used by Kroki (PNG and SVG outputs)
COPY <<EOF /build/fixtures/diagram.txt
+--------+   +-------+    +-------+
|        | --+ ditaa +--> |       |
|  Text  |   +-------+    |diagram|
|Document|   |!magic!|    |       |
|     {d}|   |       |    |       |
+---+----+   +-------+    +-------+
    :                         ^
    |       Lots of work      |
    +-------------------------+
EOF
RUN mkdir -p /opt/ditaa/lib && \
    java -Djava.awt.headless=true -agentlib:native-image-agent=config-output-dir=native-image-config -jar ditaa.jar --svg - < fixtures/diagram.txt > /dev/null && \
    java -Djava.awt.headless=true -agentlib:native-image-agent=config-merge-dir=native-image-config -jar ditaa.jar - < fixtures/diagram.txt > /dev/null && \
    java -Djava.awt.headless=true -agentlib:native-image-agent=config-merge-dir=native-image-config -jar ditaa.jar --round-corners --no-shadows --transparent - < fixtures/diagram.txt > /dev/null && \
    native-image -Djava.awt.headless=true -H:ConfigurationFileDirectories=native-image-config --no-fallback -jar ditaa.jar -o /opt/ditaa/ditaa

# Run the binary on the same base image as Kroki, the way Kroki calls it
# (the AWT font manager needs FreeType and Fontconfig, both installed in the Kroki image)
FROM ubuntu:noble AS test
RUN apt-get update && apt-get install --no-install-recommends --yes \
    fontconfig \
    fonts-dejavu-core \
    libfreetype6 && \
    apt-get clean && apt-get autoremove
COPY --from=build /opt/ditaa /opt/ditaa
RUN ln -s /opt/ditaa/ditaa /usr/bin/ditaa
COPY --from=build /build/fixtures/diagram.txt /tmp/diagram.txt
RUN ditaa --svg - < /tmp/diagram.txt > /tmp/diagram.svg && grep -q "<svg" /tmp/diagram.svg && \
    ditaa - < /tmp/diagram.txt > /tmp/diagram.png && test -s /tmp/diagram.png && \
    ditaa --round-corners --no-shadows --transparent --scale 2 - < /tmp/diagram.txt > /tmp/diagram-options.png && test -s /tmp/diagram-options.png

# The binary loads the AWT shared libraries generated next to it
FROM scratch
COPY --from=build /opt/ditaa /opt/ditaa
