# syntax=docker/dockerfile:1.28
# Pikchr (https://pikchr.org) built as a static binary from the single-file source,
# published as ghcr.io/yuzutech/kroki-builder-pikchr by the "Tool images" workflow.
# Pikchr has no releases: VERSION is the hash of a pikchr.c artifact in the Fossil repository.
ARG VERSION=85e65b968651b342c46e6334f4772b45d6cbb4317c5cbaa95d207779a50c6709

FROM ubuntu:noble AS build
ARG VERSION
RUN apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -qq --no-install-recommends --yes \
    build-essential \
    ca-certificates \
    curl > /dev/null && \
    apt-get clean && apt-get autoremove -qq > /dev/null
WORKDIR /build
RUN curl -fsSL "https://pikchr.org/home/raw/${VERSION}" -o pikchr.c
RUN gcc -O0 -g -static -Wall -Wextra -DPIKCHR_SHELL pikchr.c -o pikchr -lm

# Run the binary on the same base image as Kroki, the way Kroki calls it
FROM ubuntu:noble AS test
COPY --from=build /build/pikchr /usr/bin/pikchr
RUN echo 'box "Hello"; arrow; box "World"' | pikchr --svg-only - > /tmp/hello.svg && grep -q "<svg" /tmp/hello.svg

FROM scratch
COPY --from=build /build/pikchr /usr/bin/pikchr
