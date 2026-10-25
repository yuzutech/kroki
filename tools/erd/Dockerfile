# syntax=docker/dockerfile:1.28
# erd (https://github.com/BurntSushi/erd) built from the upstream release sources,
# published as ghcr.io/yuzutech/kroki-builder-erd by the "Tool images" workflow.
ARG VERSION=0.2.2

# erd 0.2.2 declares text 1.x and bytestring 0.10 (GHC <= 9.2), but the cabal-install
# of the GHC 9.2 images can no longer verify the Hackage index signatures.
# Build with GHC 9.6 and relax both bounds instead; text >= 2.1.2 exports a `show`
# function that clashes with Prelude's in erd's sources, hence the extra constraint.
FROM haskell:9.6.7-slim-bullseye AS build
ARG VERSION
WORKDIR /build
RUN curl -fsSL "https://github.com/BurntSushi/erd/archive/refs/tags/v${VERSION}.tar.gz" | tar -xz --strip-components=1
RUN cabal update && \
    cabal install --installdir=/build/bin --install-method=copy \
      --allow-newer=erd:text,erd:bytestring --constraint='text<2.1.2' \
      exe:erd

# Run the binary on the same base image as Kroki
FROM ubuntu:noble AS test
RUN apt-get update && apt-get install --no-install-recommends --yes \
    graphviz \
    libgmp10 && \
    apt-get clean && apt-get autoremove
COPY --from=build /build/bin/erd /usr/bin/erd
COPY --from=build /build/examples/simple.er /tmp/simple.er
RUN erd --fmt=svg < /tmp/simple.er > /tmp/simple.svg && grep -q "<svg" /tmp/simple.svg

FROM scratch
COPY --from=build /build/bin/erd /usr/bin/erd
