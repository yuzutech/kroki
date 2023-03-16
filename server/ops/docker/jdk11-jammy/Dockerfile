# syntax=docker/dockerfile:1.4
## D2
FROM golang:1.19.3-bullseye as kroki-builder-d2
COPY ops/docker/go.mod .

RUN D2_VERSION=`cat go.mod | grep "oss.terrastruct.com/d2" | cut -d' ' -f3` \
  && rm go.mod \
  && go install "oss.terrastruct.com/d2@${D2_VERSION}"

## Nomnoml
FROM node:16.18.1-bullseye-slim as kroki-builder-nomnoml

# Workaround: https://github.com/nodejs/docker-node/issues/813#issuecomment-407339011
# Error: could not get uid/gid
# [ 'nobody', 0 ]
RUN npm config set unsafe-perm true

RUN npm install -g pkg@5.6.0 pkg-fetch@3.3.0

ENV NODE node16
ENV PLATFORM linux
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch -n ${NODE} -p ${PLATFORM} -a ${ARCH}

COPY --from=nomnoml index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN npm run lint
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin

## Vega
FROM node:16.18.1-bullseye-slim as kroki-builder-vega

# Workaround: https://github.com/nodejs/docker-node/issues/813#issuecomment-407339011
# Error: could not get uid/gid
# [ 'nobody', 0 ]
RUN npm config set unsafe-perm true

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

RUN npm install -g pkg@5.6.0 pkg-fetch@3.3.0

ENV NODE node16
ENV PLATFORM linux
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch -n ${NODE} -p ${PLATFORM} -a ${ARCH}

COPY --from=vega src /app/src
COPY --from=vega tests /app/tests
COPY --from=vega package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN npm run lint && npm t
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin
RUN cp /app/node_modules/canvas/build/Release/canvas.node  /app/

## DBML
FROM node:16.18.1-bullseye-slim as kroki-builder-dbml

RUN npm config set unsafe-perm true

RUN npm install -g pkg@5.6.0 pkg-fetch@3.3.0

ENV NODE node16
ENV PLATFORM linux
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch -n ${NODE} -p ${PLATFORM} -a ${ARCH}

COPY --from=dbml index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN npm run lint
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin

## Wavedrom
FROM node:16.18.1-bullseye-slim as kroki-builder-wavedrom

# Workaround: https://github.com/nodejs/docker-node/issues/813#issuecomment-407339011
# Error: could not get uid/gid
# [ 'nobody', 0 ]
RUN npm config set unsafe-perm true

RUN npm install -g pkg@5.6.0 pkg-fetch@3.3.0

ENV NODE node16
ENV PLATFORM linux
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch -n ${NODE} -p ${PLATFORM} -a ${ARCH}

COPY --from=wavedrom index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN npm run lint
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin

## Bytefield
FROM node:16.18.1-bullseye-slim as kroki-builder-bytefield

# Workaround: https://github.com/nodejs/docker-node/issues/813#issuecomment-407339011
# Error: could not get uid/gid
# [ 'nobody', 0 ]
RUN npm config set unsafe-perm true

RUN npm install -g pkg@5.6.0 pkg-fetch@3.3.0

ENV NODE node16
ENV PLATFORM linux
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch -n ${NODE} -p ${PLATFORM} -a ${ARCH}

COPY --from=bytefield index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin

## ERD
# use a pre-built image to reduce build time
FROM yuzutech/kroki-builder-erd:0.2.1.0 as kroki-builder-static-erd
#FROM ubuntu:18.04 as kroki-builder-static-erd

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

## Pikchr
FROM ubuntu:jammy as kroki-builder-static-pikchr

ARG PIKCHR_VERSION=7269f78c4a3aa2809bd8c278e522c4eac5568ad0fd6ed0a3f807f4a2f6367ef0

RUN apt-get update && apt-get install --no-install-recommends --yes \
    build-essential \
    ca-certificates \
    wget && \
    apt-get clean && apt-get autoremove

WORKDIR build

RUN wget -q "https://pikchr.org/home/raw/${PIKCHR_VERSION}" -O pikchr.c

# build pikchr binary
RUN gcc -O0 -g -static -Wall -Wextra -DPIKCHR_SHELL pikchr.c -o pikchr -lm

## SVGBob
FROM rust:1.65-slim-bullseye AS kroki-builder-static-svgbob
RUN rustup target add x86_64-unknown-linux-musl
COPY ops/docker/Cargo.toml .

RUN SVGBOB_VERSION=`cat Cargo.toml | grep "svgbob_cli =" | sed -r 's/.*"([^"]+)"/\1/'` \
  && cargo install --quiet --target x86_64-unknown-linux-musl --version $SVGBOB_VERSION svgbob_cli

## yuzutech/kroki
FROM eclipse-temurin:11.0.17_8-jre-jammy

RUN addgroup --gecos 1000 kroki && adduser --disabled-password --ingroup kroki -u 1000 kroki

COPY --from=kroki-builder-static-svgbob /usr/local/cargo/bin/svgbob /usr/bin/svgbob
COPY --from=kroki-builder-static-erd /root/.local/bin/erd /usr/bin/erd
COPY --from=kroki-builder-static-pikchr /build/pikchr /usr/bin/pikchr
COPY --from=kroki-builder-nomnoml /app/app.bin /usr/bin/nomnoml
COPY --from=kroki-builder-vega /app/app.bin /usr/bin/vega
COPY --from=kroki-builder-vega /app/canvas.node /usr/bin/canvas.node
COPY --from=kroki-builder-dbml /app/app.bin /usr/bin/dbml
COPY --from=kroki-builder-wavedrom /app/app.bin /usr/bin/wavedrom
COPY --from=kroki-builder-bytefield /app/app.bin /usr/bin/bytefield
COPY --from=kroki-builder-d2 /go/bin/d2 /usr/bin/d2

RUN apt-get update && apt-get install --no-install-recommends --yes \
    libjpeg9 \
    giflib-tools \
    graphviz \
    fonts-freefont-ttf \
    fonts-noto-cjk && \
    apt-get clean && apt-get autoremove

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
ENV JAVA_OPTS="-Dlogback.configurationFile=/etc/kroki/logback.xml -Dvertx.logger-delegate-factory-class-name=io.vertx.core.logging.SLF4JLogDelegateFactory"

COPY --chown=kroki:kroki target/kroki-server.jar /usr/local/kroki/kroki-server.jar

EXPOSE 8000

USER kroki

ENTRYPOINT exec java $JAVA_OPTS -jar /usr/local/kroki/kroki-server.jar
