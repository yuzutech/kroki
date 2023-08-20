# syntax=docker/dockerfile:1.4

## Kroki server
FROM maven:3.9.3-eclipse-temurin-11 as kroki-builder-server
COPY --from=kroki-src . /kroki
WORKDIR /kroki
RUN apt-get update \
 && apt-get install graphviz -y \
 && apt-get clean \
 && apt-get autoremove
RUN mvn --no-transfer-progress clean package

## TikZ
FROM --platform=$BUILDPLATFORM ubuntu:jammy AS kroki-builder-dvisvgm

RUN apt-get update && apt-get install --no-install-recommends --yes \
    build-essential \
    pkg-config \
    libclipper-dev \
    libfreetype-dev \
    libkpathsea-dev \
    ghostscript \
    libssl-dev \
    zlib1g-dev \
    curl \
    ca-certificates

ARG DVISVGM_VERSION=3.0.4

ARG BUILDARCH
ARG TARGETARCH
RUN curl -LO https://github.com/mgieseki/dvisvgm/releases/download/$DVISVGM_VERSION/dvisvgm-$DVISVGM_VERSION.tar.gz && \
    tar xf dvisvgm-$DVISVGM_VERSION.tar.gz && \
    cd dvisvgm-$DVISVGM_VERSION && \
    case $BUILDARCH in \
        "amd64") MAKE_BUILD_ARCH=x86_64 ;; \
        "arm64") MAKE_BUILD_ARCH=aarch64 ;; \
        *) MAKE_BUILD_ARCH=$TARGETARCH ;; \
    esac && \
    case $TARGETARCH in \
        "amd64") MAKE_TARGET_ARCH=x86_64 ;; \
        "arm64") MAKE_TARGET_ARCH=aarch64 ;; \
        *) MAKE_TARGET_ARCH=$TARGETARCH ;; \
    esac && \
    ./configure --enable-bundled-libs --build $MAKE_BUILD_ARCH-linux-gnu --host $MAKE_TARGET_ARCH-linux-gnu && \
    make && \
    make install

## Nomnoml
FROM --platform=$BUILDPLATFORM node:18.16-bullseye-slim AS kroki-builder-nomnoml

RUN npm install -g pkg@5.8.1 pkg-fetch@3.5.2

ARG TARGETARCH
ARG TARGETOS
ENV NODE node18
RUN /usr/local/bin/pkg-fetch -n $NODE -p $TARGETOS -a $([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH")

COPY --from=nomnoml index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm install --target_arch=$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH") --target_platform=$TARGETOS && npm run lint
RUN /usr/local/bin/pkg --targets $NODE-$TARGETOS-$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH") . -o app.bin

## Vega
FROM --platform=$BUILDPLATFORM node:18.16-bullseye-slim AS kroki-builder-vega

# System dependencies for "canvas" Node package
# https://github.com/Automattic/node-canvas#compiling
RUN apt-get update && apt-get install --no-install-recommends --yes \
    build-essential \
    libcairo2-dev \
    libgif-dev \
    libjpeg-dev \
    libpango1.0-dev \
    librsvg2-dev && \
    apt-get clean && apt-get autoremove

RUN npm install -g pkg@5.8.1 pkg-fetch@3.5.2

ARG TARGETARCH
ARG TARGETOS
ENV NODE node18
RUN /usr/local/bin/pkg-fetch -n $NODE -p $TARGETOS -a $([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH")

COPY --from=vega src /app/src
COPY --from=vega tests /app/tests
COPY --from=vega package.json package-lock.json /app/
WORKDIR /app

RUN npm install 2 --target_arch=$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH") --target_platform=$TARGETOS && npm run lint && npm t
RUN /usr/local/bin/pkg --targets $NODE-$TARGETOS-$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH") . -o app.bin

## DBML
FROM --platform=$BUILDPLATFORM node:18.16-bullseye-slim AS kroki-builder-dbml

RUN npm install -g pkg@5.8.1 pkg-fetch@3.5.2

ARG TARGETARCH
ARG TARGETOS
ENV NODE node18
RUN /usr/local/bin/pkg-fetch -n $NODE -p $TARGETOS -a $([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH")

COPY --from=dbml index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm install --target_arch=$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH") --target_platform=$TARGETOS && npm run lint
RUN /usr/local/bin/pkg --targets $NODE-$TARGETOS-$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH") . -o app.bin

## Wavedrom
FROM --platform=$BUILDPLATFORM node:18.16-bullseye-slim AS kroki-builder-wavedrom

RUN npm install -g pkg@5.8.1 pkg-fetch@3.5.2

ARG TARGETARCH
ARG TARGETOS
ENV NODE node18
RUN /usr/local/bin/pkg-fetch -n $NODE -p $TARGETOS -a $([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH")

COPY --from=wavedrom index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm install --target_arch=$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH") --target_platform=$TARGETOS && npm run lint
RUN /usr/local/bin/pkg --targets $NODE-$TARGETOS-$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH") . -o app.bin

## Bytefield
FROM --platform=$BUILDPLATFORM node:18.16-bullseye-slim AS kroki-builder-bytefield

RUN npm install -g pkg@5.8.1 pkg-fetch@3.5.2

ARG TARGETARCH
ARG TARGETOS
ENV NODE node18
RUN /usr/local/bin/pkg-fetch -n $NODE -p $TARGETOS -a $([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH")

COPY --from=bytefield index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm install --target_arch=$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH") --target_platform=$TARGETOS
RUN /usr/local/bin/pkg --targets $NODE-$TARGETOS-$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "$TARGETARCH") . -o app.bin

## ERD
# use a pre-built image to reduce build time
FROM yuzutech/kroki-builder-erd:0.2.1.0 AS kroki-builder-static-erd
#FROM ubuntu:18.04 AS kroki-builder-static-erd

#ARG ERD_VERSION=0.2.1.0

#RUN apt-get -qq update && apt-get install -qq -y graphviz curl git > /dev/null

#RUN curl -sSL https://get.haskellstack.org/ | sh -s - -q > /dev/null

#RUN git clone https://github.com/BurntSushi/erd.git

#WORKDIR erd

#RUN git checkout "v${ERD_VERSION}"

# build static executable binary
#RUN /usr/local/bin/stack install --silent --ghc-options="-fPIC" \
#  --ghc-options="-static" \
#  --ghc-options="-optl=-static" \
#  --ghc-options="-optc=-static" \
#  --ghc-options="-w"

## Symbolator
FROM ubuntu:jammy AS kroki-builder-static-symbolator

# Build from forked source because upstream is broken for the latest python3 versions
ARG SYMBOLATOR_VERSION=1.2.2
ARG SYMBOLATOR_SOURCE=git+https://github.com/zebreus/symbolator.git@v$SYMBOLATOR_VERSION

RUN apt-get update && apt-get install --no-install-recommends --yes \
    git \
    pip \
    python3-dev \
    patchelf \
    python3-gi-cairo \
    python3-gi \
    build-essential \
    libpango1.0-dev && \
    apt-get clean && apt-get autoremove

WORKDIR /build

# Install latest pip and setuptools
RUN python3 -m pip install --upgrade pip setuptools
RUN python3 -m pip install --upgrade nuitka
# Install symbolator
RUN python3 -m pip install --upgrade ${SYMBOLATOR_SOURCE}

# Use nuitka to compile a static binary so we dont need python in the final image
RUN python3 -m nuitka --onefile `which symbolator` --include-module=gi.overrides.Pango --include-module=gi._gi_cairo

## Pikchr
FROM ubuntu:jammy AS kroki-builder-static-pikchr

ARG PIKCHR_VERSION=7269f78c4a3aa2809bd8c278e522c4eac5568ad0fd6ed0a3f807f4a2f6367ef0

RUN apt-get update && apt-get install --no-install-recommends --yes \
    build-essential \
    ca-certificates \
    wget && \
    apt-get clean && apt-get autoremove

WORKDIR /build

RUN wget -q "https://pikchr.org/home/raw/${PIKCHR_VERSION}" -O pikchr.c

# build pikchr binary
RUN gcc -O0 -g -static -Wall -Wextra -DPIKCHR_SHELL pikchr.c -o pikchr -lm

## SVGBob
FROM --platform=$BUILDPLATFORM rust:1.71-slim-bullseye AS kroki-builder-static-svgbob

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

## UMlet
# use a pre-built image to reduce build time

## PlantUML
# use a pre-built image to reduce build time

## yuzutech/kroki
FROM eclipse-temurin:11.0.19_7-jre-jammy

ARG D2_VERSION="0.5.1"
ARG PLANTUML_VERSION="1.2023.10"
ARG UMLET_VERSION="2023-03-20_UMLet_v15.1"
ARG GRAPHVIZ_VERSION="8.0.5"
ARG DITAA_VERSION="1.0.3"
ARG BLOCKDIAG_VERSION="3.1.0"
ARG TARGETARCH

LABEL \
    org.opencontainers.image.title="Kroki" \
    org.opencontainers.image.description="Kroki provides a unified API supporting multiple diagramming formats, making it easy to create diagrams from textual descriptions." \
    org.opencontainers.image.url="https://kroki.io" \
    org.opencontainers.image.source="https://github.com/yuzutech/kroki" \
    org.opencontainers.image.licenses="MIT"

RUN addgroup --gecos 1000 kroki && adduser --disabled-password --ingroup kroki -u 1000 kroki

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
    libpangocairo-1.0 \
    libgd3 \
    libjpeg9 \
    libpango1.0-0 \
    giflib-tools \
    fonts-freefont-ttf \
    fonts-noto-cjk \
    fonts-liberation \
    gsfonts \
    ghostscript \
    poppler-utils \
    texlive \
    texlive-latex-extra \
    texlive-pictures \
    texlive-pstricks \
    texlive-science && \
    apt-get clean && apt-get autoremove

RUN wget "https://github.com/yuzutech/graphviz-builder/releases/download/${GRAPHVIZ_VERSION}/dot-linux-${TARGETARCH}" -O /usr/bin/dot && \
    chmod +x /usr/bin/dot

RUN wget "https://github.com/yuzutech/ditaa-mini/releases/download/${DITAA_VERSION}/ditaamini-linux-${TARGETARCH}-${DITAA_VERSION}" -O /usr/bin/ditaa && \
    chmod +x /usr/bin/ditaa

RUN wget "https://github.com/terrastruct/d2/releases/download/v${D2_VERSION}/d2-v${D2_VERSION}-linux-${TARGETARCH}.tar.gz" -O - | tar -zxv -C /usr/bin d2-v${D2_VERSION}/bin/d2 && \
    mv usr/bin/d2-v${D2_VERSION}/bin/d2 /usr/bin/d2 && \
    chmod +x /usr/bin/d2

RUN wget "https://github.com/yuzutech/plantuml/releases/download/v${PLANTUML_VERSION}/plantuml-linux-${TARGETARCH}-${PLANTUML_VERSION}" -O /usr/bin/plantuml && \
    chmod +x /usr/bin/plantuml

RUN wget "https://github.com/yuzutech/umlet/releases/download/${UMLET_VERSION}/umlet-linux-${TARGETARCH}" -O /usr/bin/umlet && \
    chmod +x /usr/bin/umlet

RUN wget "https://github.com/yuzutech/blockdiag/releases/download/v${BLOCKDIAG_VERSION}/blockdiag-bundle-linux-${TARGETARCH}.bin" -O /usr/bin/blockdiag && \
    chmod +x /usr/bin/blockdiag

COPY --from=kroki-builder-static-svgbob /usr/local/cargo/bin/svgbob_cli /usr/bin/svgbob
COPY --from=kroki-builder-static-erd /root/.local/bin/erd /usr/bin/erd
COPY --from=kroki-builder-static-pikchr /build/pikchr /usr/bin/pikchr
COPY --from=kroki-builder-nomnoml /app/app.bin /usr/bin/nomnoml
COPY --from=kroki-builder-vega /app/app.bin /usr/bin/vega
COPY --from=kroki-builder-dbml /app/app.bin /usr/bin/dbml
COPY --from=kroki-builder-wavedrom /app/app.bin /usr/bin/wavedrom
COPY --from=kroki-builder-static-symbolator /build/symbolator.bin /usr/bin/symbolator
COPY --from=kroki-builder-bytefield /app/app.bin /usr/bin/bytefield
COPY --from=kroki-builder-dvisvgm /usr/local/bin/dvisvgm /usr/bin/dvisvgm
COPY --from=tikz tikz2svg /usr/bin/tikz2svg

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
ENV KROKI_BLOCKDIAG_BIN_PATH=/usr/bin/blockdiag
ENV JAVA_OPTS="-Dlogback.configurationFile=/etc/kroki/logback.xml -Dvertx.logger-delegate-factory-class-name=io.vertx.core.logging.SLF4JLogDelegateFactory"

COPY --from=kroki-builder-server --chown=kroki:kroki /kroki/server/target/kroki-server.jar /usr/local/kroki/kroki-server.jar

EXPOSE 8000

USER kroki

ENTRYPOINT exec java $JAVA_OPTS -jar /usr/local/kroki/kroki-server.jar
