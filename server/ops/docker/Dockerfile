# syntax=docker/dockerfile:1.28

## Node.js for the target platform (provides the binary used to assemble SEA executables)
FROM node:24.19-bookworm-slim AS kroki-node-target

## Nomnoml
FROM --platform=$BUILDPLATFORM node:24.19-bookworm-slim AS kroki-builder-nomnoml

COPY --from=nomnoml index.js package.json package-lock.json biome.json sea-config.json /app/
WORKDIR /app

RUN npm install --no-audit --no-fund --no-update-notifier --loglevel=error && npm run lint
RUN npm run build:bundle && npm run build:blob
COPY --from=kroki-node-target /usr/local/bin/node /app/build/app.bin
RUN npm run build:inject

## Vega
FROM --platform=$BUILDPLATFORM ubuntu:resolute AS kroki-builder-vega

RUN apt-get update && apt-get install --no-install-recommends --yes \
    curl \
    ca-certificates \
    unzip && \
    apt-get clean && apt-get autoremove

RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh

COPY --from=vega src /app/src
COPY --from=vega tests /app/tests
COPY --from=vega deno.json deno.lock /app/

WORKDIR /app

ARG TARGETARCH
RUN case "${TARGETARCH}" in \
    "amd64") ARCH="x86_64" ;; \
    "arm64") ARCH="aarch64" ;; \
    *) echo "Unsupported arch: ${TARGETARCH}" && exit 1 ;; \
    esac && \
    deno compile --target="${ARCH}-unknown-linux-gnu" --include=node_modules --node-modules-dir=auto --allow-ffi --output "app.bin" ./src/main.ts

## DBML
FROM --platform=$BUILDPLATFORM node:24.19-bookworm-slim AS kroki-builder-dbml

COPY --from=dbml index.js package.json package-lock.json biome.json sea-config.json /app/
WORKDIR /app

RUN npm install --no-audit --no-fund --no-update-notifier --loglevel=error && npm run lint
RUN npm run build:bundle && npm run build:blob
COPY --from=kroki-node-target /usr/local/bin/node /app/build/app.bin
RUN npm run build:inject

## Wavedrom
FROM --platform=$BUILDPLATFORM node:24.19-bookworm-slim AS kroki-builder-wavedrom

COPY --from=wavedrom index.js convert.js package.json package-lock.json biome.json sea-config.json /app/
WORKDIR /app

RUN npm install --no-audit --no-fund --no-update-notifier --loglevel=error && npm run lint
RUN npm run build:bundle && npm run build:blob
COPY --from=kroki-node-target /usr/local/bin/node /app/build/app.bin
RUN npm run build:inject

## Bytefield
FROM --platform=$BUILDPLATFORM node:24.19-bookworm-slim AS kroki-builder-bytefield

COPY --from=bytefield index.js package.json package-lock.json biome.json sea-config.json /app/
WORKDIR /app

RUN npm install --no-audit --no-fund --no-update-notifier --loglevel=error && npm run lint
RUN npm run build:bundle && npm run build:blob
COPY --from=kroki-node-target /usr/local/bin/node /app/build/app.bin
RUN npm run build:inject

## Symbolator (built by the "Tool images" workflow, see tools/symbolator)
FROM ghcr.io/yuzutech/kroki-builder-symbolator:1.2.2 AS kroki-builder-static-symbolator

## Pikchr (built by the "Tool images" workflow, see tools/pikchr)
FROM ghcr.io/yuzutech/kroki-builder-pikchr:85e65b968651b342c46e6334f4772b45d6cbb4317c5cbaa95d207779a50c6709 AS kroki-builder-static-pikchr

## SVGBob
FROM --platform=$BUILDPLATFORM rust:1.97-slim-bullseye AS kroki-builder-static-svgbob

# Install cross-compilation tools
RUN apt-get update && apt-get install --no-install-recommends --yes \
    gcc-aarch64-linux-gnu \
    gcc-x86-64-linux-gnu \
    libc6-dev-amd64-cross \
    libc6-dev-arm64-cross && \
    apt-get clean && apt-get autoremove

COPY ops/docker/Cargo.toml .
COPY ops/docker/.cargo .cargo

ARG TARGETARCH
ENV CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse
RUN SVGBOB_VERSION=`cat Cargo.toml | grep "svgbob_cli =" | sed -r 's/.*"([^"]+)"/\1/'` && \
    case $TARGETARCH in \
        "amd64") RUST_TARGET_ARCH=x86_64 ;; \
        "arm64") RUST_TARGET_ARCH=aarch64 ;; \
        *) RUST_TARGET_ARCH=$TARGETARCH ;; \
    esac && \
    rustup target add $RUST_TARGET_ARCH-unknown-linux-gnu && \
    cargo install --quiet --target $RUST_TARGET_ARCH-unknown-linux-gnu --version $SVGBOB_VERSION svgbob_cli

## Lini
FROM --platform=$BUILDPLATFORM rust:1.97-slim-bullseye AS kroki-builder-static-lini

# Install cross-compilation tools
RUN apt-get update && apt-get install --no-install-recommends --yes \
    gcc-aarch64-linux-gnu \
    gcc-x86-64-linux-gnu \
    libc6-dev-amd64-cross \
    libc6-dev-arm64-cross && \
    apt-get clean && apt-get autoremove

COPY ops/docker/Cargo.toml .
COPY ops/docker/.cargo .cargo

ARG TARGETARCH
ENV CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse
RUN LINI_VERSION=`cat Cargo.toml | grep "^lini =" | sed -r 's/.*"([^"]+)"/\1/'` && \
    case $TARGETARCH in \
        "amd64") RUST_TARGET_ARCH=x86_64 ;; \
        "arm64") RUST_TARGET_ARCH=aarch64 ;; \
        *) RUST_TARGET_ARCH=$TARGETARCH ;; \
    esac && \
    rustup target add $RUST_TARGET_ARCH-unknown-linux-gnu && \
    cargo install --quiet --locked --target $RUST_TARGET_ARCH-unknown-linux-gnu --version $LINI_VERSION lini

## Erd (built by the "Tool images" workflow, see tools/erd)
FROM ghcr.io/yuzutech/kroki-builder-erd:0.2.2 AS erd

## Graphviz (built by the "Tool images" workflow, see tools/graphviz)
FROM ghcr.io/yuzutech/kroki-builder-graphviz:14.1.3 AS graphviz

## blockdiag (built by the "Tool images" workflow, see tools/blockdiag)
FROM ghcr.io/yuzutech/kroki-builder-blockdiag:3.4.2 AS blockdiag

## WireViz (built by the "Tool images" workflow, see tools/wireviz)
FROM ghcr.io/yuzutech/kroki-builder-wireviz:0.3.3 AS wireviz

## GoAT
FROM --platform=$BUILDPLATFORM golang:1.26.5-alpine AS kroki-builder-goat

ARG GOAT_VERSION=0.5.1

RUN apk add git
ARG TARGETOS
ARG TARGETARCH
# Cross-compile for the target platform: when it differs from the build platform,
# go install puts the binary in /go/bin/<os>_<arch>/ instead of /go/bin/
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go install "github.com/blampe/goat/cmd/goat@v${GOAT_VERSION}" && \
    if [ -f "/go/bin/${TARGETOS}_${TARGETARCH}/goat" ]; then mv "/go/bin/${TARGETOS}_${TARGETARCH}/goat" /go/bin/goat; fi

## yuzutech/kroki
FROM eclipse-temurin:21.0.12.1_1-jre-resolute

ARG D2_VERSION="0.9.0"
ARG DITAA_VERSION="1.0.3"
ARG DVISVGM_VERSION="3.6+ds-1"
ARG PLANTUML_VERSION="1.2026.9"
ARG UMLET_VERSION="2023-03-20_UMLet_v15.1"
ARG TARGETARCH

RUN apt-get update && apt-get install --no-install-recommends --yes \
    adduser && \
    addgroup --gecos 1001 kroki && adduser --disabled-password --ingroup kroki -u 1001 kroki

# For TikZ
#
# * ghostscript - Dynamically linked dependency required by dvisvgm
# * poppler-utils - Provides pdftocairo for latex to jpeg and png
# * texlive - Provides latex
# * texlive-latexextra - Provides the "standalone" package to remove figure
#   captions
# * texlive-pictures - Provides various graphics packages like "circuitikz"
# * texlive-science - Provides various science packages like "siunitx"
RUN apt-get update && apt-get install --no-install-recommends --yes \
    unzip \
    dvisvgm=$DVISVGM_VERSION \
    libpango1.0-dev \
    librsvg2-dev \
    fonts-freefont-ttf \
    fonts-liberation \
    fonts-noto-cjk \
    ghostscript \
    giflib-tools \
    gsfonts \
    libnuma1 \
    libgd3 \
    libgif-dev \
    libjpeg-dev \
    libgirepository-1.0-1 \
    libcairo2-dev \
    libcairo-gobject2 \
    libjpeg9 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    poppler-utils \
    texlive \
    texlive-latex-extra \
    texlive-pictures \
    texlive-pstricks \
    texlive-science && \
    apt-get clean && apt-get autoremove

COPY --from=vega packages packages
RUN dpkg -i packages/libjpeg62-turbo_2.1.5-4_${TARGETARCH}.deb

RUN wget "https://github.com/yuzutech/ditaa-mini/releases/download/${DITAA_VERSION}/ditaamini-linux-${TARGETARCH}-${DITAA_VERSION}" -O /usr/bin/ditaa && \
    chmod +x /usr/bin/ditaa

RUN wget "https://github.com/terrastruct/d2/releases/download/v${D2_VERSION}/d2-v${D2_VERSION}-linux-${TARGETARCH}.tar.gz" -O - | tar -zxv -C /usr/bin d2-v${D2_VERSION}/bin/d2 && \
    mv usr/bin/d2-v${D2_VERSION}/bin/d2 /usr/bin/d2 && \
    chmod +x /usr/bin/d2

RUN wget "https://github.com/plantuml/plantuml/releases/download/v${PLANTUML_VERSION}/native-plantuml-linux-${TARGETARCH}-${PLANTUML_VERSION}.zip" -O plantuml-bin.zip && \
    unzip plantuml-bin.zip -d plantuml && \
    mv plantuml/* /usr/bin/ && \
    chmod +x /usr/bin/plantuml

RUN wget "https://github.com/yuzutech/umlet/releases/download/${UMLET_VERSION}/umlet-linux-${TARGETARCH}" -O /usr/bin/umlet && \
    chmod +x /usr/bin/umlet

COPY --from=blockdiag /usr/bin/blockdiag /usr/bin/blockdiag
COPY --from=wireviz /usr/bin/wireviz /usr/bin/wireviz
COPY --from=erd /usr/bin/erd /usr/bin/erd
COPY --from=graphviz /usr/bin/dot /usr/bin/dot
COPY --from=kroki-builder-bytefield /app/build/app.bin /usr/bin/bytefield
COPY --from=kroki-builder-dbml /app/build/app.bin /usr/bin/dbml
COPY --from=kroki-builder-nomnoml /app/build/app.bin /usr/bin/nomnoml
COPY --from=kroki-builder-static-pikchr /usr/bin/pikchr /usr/bin/pikchr
COPY --from=kroki-builder-static-svgbob /usr/local/cargo/bin/svgbob_cli /usr/bin/svgbob
COPY --from=kroki-builder-static-symbolator /usr/bin/symbolator /usr/bin/symbolator
COPY --from=kroki-builder-vega /app/app.bin /usr/bin/vega
COPY --from=kroki-builder-wavedrom /app/build/app.bin /usr/bin/wavedrom
COPY --from=tikz tikz2svg /usr/bin/tikz2svg
COPY --from=kroki-builder-goat /go/bin/goat /usr/bin/goat
COPY --from=kroki-builder-static-lini /usr/local/cargo/bin/lini /usr/bin/lini

COPY --chown=kroki:kroki ops/docker/logback.xml /etc/kroki/logback.xml

ENV KROKI_CONTAINER_SUPPORT=""
ENV KROKI_SAFE_MODE=secure
ENV KROKI_SVGBOB_BIN_PATH=/usr/bin/svgbob
ENV KROKI_ERD_BIN_PATH=/usr/bin/erd
ENV KROKI_DOT_BIN_PATH=/usr/bin/dot
ENV KROKI_NOMNOML_BIN_PATH=/usr/bin/nomnoml
ENV KROKI_VEGA_BIN_PATH=/usr/bin/vega
ENV KROKI_DBML_BIN_PATH=/usr/bin/dbml
ENV KROKI_WAVEDROM_BIN_PATH=/usr/bin/wavedrom
ENV KROKI_BYTEFIELD_BIN_PATH=/usr/bin/bytefield
ENV KROKI_PIKCHR_BIN_PATH=/usr/bin/pikchr
ENV KROKI_D2_BIN_PATH=/usr/bin/d2
ENV KROKI_UMLET_BIN_PATH=/usr/bin/umlet
ENV KROKI_PLANTUML_BIN_PATH=/usr/bin/plantuml
ENV KROKI_TIKZ2SVG_BIN_PATH=/usr/bin/tikz2svg
ENV KROKI_DITAA_BIN_PATH=/usr/bin/ditaa
ENV KROKI_SYMBOLATOR_BIN_PATH=/usr/bin/symbolator
ENV KROKI_WIREVIZ_BIN_PATH=/usr/bin/wireviz
ENV KROKI_LINI_BIN_PATH=/usr/bin/lini
ENV JAVA_OPTS="-Dlogback.configurationFile=/etc/kroki/logback.xml -Dvertx.logger-delegate-factory-class-name=io.vertx.core.logging.SLF4JLogDelegateFactory"

COPY --chown=kroki:kroki target/kroki-server.jar /usr/local/kroki/kroki-server.jar

RUN mkdir /tmp/vertx-cache && chown kroki:kroki /tmp/vertx-cache

EXPOSE 8000

USER kroki

ENTRYPOINT exec java $JAVA_OPTS -jar /usr/local/kroki/kroki-server.jar
