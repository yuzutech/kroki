# syntax=docker/dockerfile:1.28
# WireViz compiled to a single binary with Nuitka (so the Kroki image does not need Python),
# published as ghcr.io/yuzutech/kroki-builder-wireviz by the "Tool images" workflow.
# Built from the yuzutech/WireViz fork, which reads/writes stdin/stdout in CLI mode,
# until these changes land upstream (https://github.com/wireviz/WireViz).
# renovate: datasource=github-tags depName=yuzutech/WireViz extractVersion=^v(?<version>.+)$
ARG VERSION=0.3.3

# The binary bundles Python and its libraries, and runs on any glibc at least as recent as Debian bookworm's
FROM python:3.11-slim-bookworm AS build
ARG VERSION
RUN apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -qq --no-install-recommends --yes \
    ca-certificates \
    curl \
    gcc \
    libc6-dev \
    patchelf > /dev/null && \
    apt-get clean && apt-get autoremove -qq > /dev/null
WORKDIR /build
RUN curl -fsSL "https://github.com/yuzutech/WireViz/archive/refs/tags/v${VERSION}.tar.gz" | tar -xz --strip-components=1
RUN pip install --no-cache-dir nuitka .
RUN python3 -m nuitka --include-module=wireviz --onefile src/wireviz --output-filename=wireviz

# Run the binary on the same base image as Kroki, the way Kroki calls it (WireViz runs Graphviz `dot`)
FROM ubuntu:noble AS test
RUN apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -qq --no-install-recommends --yes \
    graphviz > /dev/null && \
    apt-get clean && apt-get autoremove -qq > /dev/null
COPY --from=build /build/wireviz /usr/bin/wireviz
COPY --from=build /build/examples/demo01.yml /tmp/demo01.yml
RUN for format in svg png; do \
      wireviz --format=$format - < /tmp/demo01.yml > "/tmp/demo01.$format" && test -s "/tmp/demo01.$format" || exit 1; \
    done && \
    grep -q "<svg" /tmp/demo01.svg

FROM scratch
COPY --from=build /build/wireviz /usr/bin/wireviz
