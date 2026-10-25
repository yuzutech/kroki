# syntax=docker/dockerfile:1.28
# symbolator compiled to a single binary with Nuitka (so the Kroki image does not need Python),
# published as ghcr.io/yuzutech/kroki-builder-symbolator by the "Tool images" workflow.
# renovate: datasource=github-tags depName=zebreus/symbolator extractVersion=^v(?<version>.+)$
ARG VERSION=1.2.2

# Keep ubuntu:noble: Nuitka produces a binary that crashes at runtime on ubuntu:resolute
FROM ubuntu:noble AS build
ARG VERSION
# Build from forked source because upstream is broken for the latest python3 versions
ARG SYMBOLATOR_SOURCE=git+https://github.com/zebreus/symbolator.git@v$VERSION

RUN apt-get update && apt-get install --no-install-recommends --yes \
    build-essential \
    git \
    pip \
    python3-dev \
    patchelf \
    python3-gi-cairo \
    python3-gi \
    python3-pip \
    python3-setuptools \
    libpango1.0-dev && \
    apt-get clean && apt-get autoremove

WORKDIR /build

RUN python3 -m pip install --break-system-packages --upgrade nuitka
RUN python3 -m pip install --break-system-packages --upgrade ${SYMBOLATOR_SOURCE}

RUN python3 -m nuitka --onefile `which symbolator` --include-module=gi.overrides.Pango --include-module=gi._gi_cairo

# Run the binary on the same base image as Kroki, with the same runtime libraries
FROM ubuntu:noble AS test
RUN apt-get update && apt-get install --no-install-recommends --yes \
    fonts-liberation \
    libpango1.0-dev \
    libgirepository-1.0 \
    libcairo2-dev \
    libcairo-gobject2 && \
    apt-get clean && apt-get autoremove
COPY --from=build /build/symbolator.bin /usr/bin/symbolator
COPY <<EOF /tmp/component.sv
module demo_device #(
    parameter SIZE = 8
) (
    input wire clock,
    input wire [SIZE-1:0] data_in,
    output wire [SIZE-1:0] data_out
);
endmodule
EOF
RUN symbolator --input /tmp/component.sv --output /tmp --format svg && grep -q "<svg" /tmp/demo_device.svg

FROM scratch
COPY --from=build /build/symbolator.bin /usr/bin/symbolator
