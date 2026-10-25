# syntax=docker/dockerfile:1.28
# Graphviz `dot` built from the upstream release sources (statically linked against the Graphviz libraries),
# published as ghcr.io/yuzutech/kroki-builder-graphviz by the "Tool images" workflow.
# Replaces https://github.com/yuzutech/graphviz-builder
# renovate: datasource=gitlab-releases depName=graphviz/graphviz registryUrl=https://gitlab.com
ARG VERSION=14.1.3

# Build on the same Ubuntu release as the Kroki image, so that `dot` links against the system libraries it provides
FROM ubuntu:noble AS build
ARG VERSION
RUN apt-get update && apt-get install --no-install-recommends --yes \
    build-essential \
    ca-certificates \
    wget \
    libx11-6 \
    libxmu6 \
    libxt6 \
    liblab-gamut1 \
    fonts-liberation \
    libpango1.0-dev \
    libpangocairo-1.0-0 \
    libcairo2-dev \
    libcairo2 \
    libglib2.0-0 \
    libgd-dev \
    zlib1g-dev \
    libpangoft2-1.0-0 \
    libgvc6 \
    libjpeg9 \
    giflib-tools \
    fonts-freefont-ttf \
    fonts-noto-cjk \
    gsfonts \
    ghostscript && \
    apt-get clean && apt-get autoremove
WORKDIR /build
RUN wget -q "https://gitlab.com/api/v4/projects/4207231/packages/generic/graphviz-releases/${VERSION}/graphviz-${VERSION}.tar.gz" -O graphviz.tar.gz && \
    mkdir -p graphviz-src && \
    tar xzf graphviz.tar.gz --strip-components=1 -C graphviz-src
WORKDIR /build/graphviz-src
RUN ./configure \
      --prefix=/usr \
      --sysconfdir=/etc \
      --disable-python \
      --disable-silent-rules \
      --disable-dependency-tracking \
      --disable-ltdl-install \
      --enable-static=yes \
      --enable-shared=no \
      --enable-ltdl \
      --enable-sharp=no \
      --enable-go=no \
      --enable-guile=no \
      --enable-java=no \
      --enable-lua=yes \
      --enable-ocaml=no \
      --enable-perl=no \
      --enable-php=no \
      --enable-python3=no \
      --enable-r=no \
      --enable-ruby=no \
      --enable-tcl=no \
      --without-included-ltdl \
      --with-gdk-pixbuf=yes \
      --with-ipsepcola=yes \
      --with-jpeg \
      --with-libgd=yes \
      --with-pangocairo=yes \
      --with-rsvg=yes \
      --with-x && \
    make -j"$(nproc)"

# Run the binary on the same base image as Kroki, with the same runtime libraries
FROM ubuntu:noble AS test
RUN apt-get update && apt-get install --no-install-recommends --yes \
    fonts-liberation \
    libpango1.0-dev \
    librsvg2-dev \
    libgd3 \
    libcairo2-dev \
    libjpeg9 && \
    apt-get clean && apt-get autoremove
COPY --from=build /build/graphviz-src/cmd/dot/dot_static /usr/bin/dot
RUN dot -V && \
    for format in svg png jpeg pdf; do \
      echo "digraph G {Hello->World}" | dot -T"$format" > "/tmp/hello.$format" && test -s "/tmp/hello.$format" || exit 1; \
    done && \
    grep -q "<svg" /tmp/hello.svg

FROM scratch
COPY --from=build /build/graphviz-src/cmd/dot/dot_static /usr/bin/dot
