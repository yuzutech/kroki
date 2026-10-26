# syntax=docker/dockerfile:1.28
# blockdiag, actdiag, nwdiag, packetdiag, rackdiag and seqdiag compiled to a single binary with Nuitka
# (so the Kroki image does not need Python), published as ghcr.io/yuzutech/kroki-builder-blockdiag by the "Tool images" workflow.
# Built from the yuzutech/blockdiag fork: upstream looks abandoned, and the fork works with recent Python versions
# and reads/writes stdin/stdout in CLI mode.
# renovate: datasource=github-tags depName=yuzutech/blockdiag extractVersion=^v(?<version>.+)$
ARG VERSION=3.4.2

# The binary bundles Python and its libraries, and runs on any glibc at least as recent as Debian bookworm's
FROM python:3.11-slim-bookworm AS build
ARG VERSION
RUN apt-get update && apt-get install --no-install-recommends --yes \
    ca-certificates \
    curl \
    gcc \
    libc6-dev \
    patchelf && \
    apt-get clean && apt-get autoremove
WORKDIR /build
RUN curl -fsSL "https://github.com/yuzutech/blockdiag/archive/refs/tags/v${VERSION}.tar.gz" | tar -xz --strip-components=1
RUN pip install --no-cache-dir nuitka docutils ".[pdf]" seqdiag nwdiag actdiag
RUN python3 -m nuitka --nofollow-import-to=*.tests \
      --nofollow-import-to=reportlab.graphics.testshapes \
      --include-package=actdiag \
      --include-package=nwdiag \
      --include-package=seqdiag \
      --include-package=packetdiag \
      --include-package=rackdiag \
      --include-module=reportlab.pdfgen.canvas \
      --include-package=blockdiag.imagedraw \
      --include-package=blockdiag.plugins \
      --include-package=blockdiag.utils \
      --include-package=blockdiag.noderenderer \
      --onefile src/blockdiag \
      --output-filename=blockdiag

# Run the binary on the same base image as Kroki, the way Kroki calls it
FROM ubuntu:noble AS test
RUN apt-get update && apt-get install --no-install-recommends --yes \
    fonts-dejavu-core && \
    apt-get clean && apt-get autoremove
COPY --from=build /build/blockdiag /usr/bin/blockdiag
COPY <<EOF /tmp/diagrams/blockdiag.diag
blockdiag { A -> B; }
EOF
COPY <<EOF /tmp/diagrams/seqdiag.diag
seqdiag { A -> B; }
EOF
COPY <<EOF /tmp/diagrams/actdiag.diag
actdiag { A -> B; }
EOF
COPY <<EOF /tmp/diagrams/nwdiag.diag
nwdiag { network lan { A; B; } }
EOF
COPY <<EOF /tmp/diagrams/packetdiag.diag
packetdiag { 0-15: Source Port; 16-31: Destination Port; }
EOF
COPY <<EOF /tmp/diagrams/rackdiag.diag
rackdiag { 1: Server; 2: Switch; }
EOF
RUN for module in blockdiag seqdiag actdiag nwdiag packetdiag rackdiag; do \
      for format in svg png pdf; do \
        blockdiag --module=$module --font=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf -T$format - < "/tmp/diagrams/$module.diag" > "/tmp/$module.$format" && \
        test -s "/tmp/$module.$format" || exit 1; \
      done; \
    done && \
    grep -q "<svg" /tmp/blockdiag.svg

FROM scratch
COPY --from=build /build/blockdiag /usr/bin/blockdiag
