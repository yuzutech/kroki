#
# Building V8 for alpine is a real pain. We have to compile from source, because it has to be
# linked against musl, and we also have to recompile some of the build tools as the official
# build workflow tends to assume glibc by including vendored tools that link against it.
#
# The general strategy is this:
#
#   1. Build GN for alpine (this is a build dependency) 
#   2. Use depot_tools to fetch the V8 source and dependencies (needs glibc)
#   3. Build V8 for alpine
#   4. Make warez
#

#
# STEP 1
# Build GN for alpine
#
FROM alpine:3.16.3 as gn-builder

# This is the GN commit that we want to build. Most commits will probably build just fine but
# this happened to be the latest commit when I did this.
ARG GN_COMMIT=1c4151ff5c1d6fbf7fa800b8d4bb34d3abc03a41

RUN \
  apk add --update --virtual .gn-build-dependencies \
    alpine-sdk \
    binutils-gold \
    clang \
    curl \
    git \
    llvm12 \
    ninja \
    python3 \
    tar \
    xz \
  # Quick fixes: we need the LLVM tooling in $PATH, and we also have to use gold instead of ld.
  && PATH=$PATH:/usr/lib/llvm12/bin \
  && cp -f /usr/bin/ld.gold /usr/bin/ld \
  # Clone and build gn
  && git clone https://gn.googlesource.com/gn /tmp/gn \
  && git -C /tmp/gn checkout ${GN_COMMIT} \
  && cd /tmp/gn \
  && python3 build/gen.py \
  && ninja -C out \
  && cp -f /tmp/gn/out/gn /usr/local/bin/gn

#
# STEP 2
# Use depot_tools to fetch the V8 source and dependencies
#
# The depot_tools scripts have a hard dependency on glibc (or at least a soft one that I didn't
# bother figuring out). Fortunately we only need it to actually download the source and its dependencies
# so we can do this in a place with glibc, and then pass the results on to an alpine builder.
#
FROM debian:11.5 as source

# The V8 version we want to use. It's assumed that this will be a version tag, but it's just
# used as "git commit $V8_VERSION" so anything that git can resolve will work.
# Compatible with d2 version 0.0.13
# rogchap.com/v8go v0.7.1-0.20221102201510-1f00b5007d9
ARG V8_VERSION=9.7.106.19

RUN \
  set -x && \
  apt-get update && \
  apt-get install -y \
    git \
    curl \
    xz-utils \
    python3 && \
  # Clone depot_tools
  git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git /tmp/depot_tools && \
  PATH=$PATH:/tmp/depot_tools && \
  # fetch V8
  cd /tmp && \
  fetch v8 && \
  cd /tmp/v8 && \
  git -c advice.detachedHead=false checkout ${V8_VERSION} && \
  gclient sync

#
# STEP 3
# Build V8 for alpine
#
FROM alpine:3.16.3 as v8

COPY --from=source /tmp/v8 /tmp/v8
COPY --from=gn-builder /usr/local/bin/gn /tmp/v8/buildtools/linux64/gn

RUN \
  apk add --update --virtual .v8-build-dependencies \
    curl \
    g++ \
    gcc \
    glib-dev \
    icu-dev \
    libstdc++ \
    linux-headers \
    make \
    ninja \
    python3 \
    tar \
    xz \
  && ln -s /usr/bin/python3 /usr/bin/python \
  # Configure our V8 build
  && cd /tmp/v8 && \
  ./tools/dev/v8gen.py x64.release -- \
    binutils_path=\"/usr/bin\" \
    target_os=\"linux\" \
    target_cpu=\"x64\" \
    v8_target_cpu=\"x64\" \
    v8_enable_future=true \
    is_official_build=true \
    is_component_build=false \
    is_cfi=false \
    is_clang=false \
    use_custom_libcxx=false \
    use_sysroot=false \
    use_gold=false \
    use_allocator_shim=false \
    treat_warnings_as_errors=false \
    symbol_level=0 \
    strip_debug_info=true \
    v8_use_external_startup_data=false \
    v8_enable_i18n_support=false \
    v8_enable_gdbjit=false \
    v8_static_library=true \
    v8_experimental_extra_library_files=[] \
    v8_extra_library_files=[] \
  # Build V8
  && ninja -C out.gn/x64.release -j $(getconf _NPROCESSORS_ONLN) \
  # Brag
  && find /tmp/v8/out.gn/x64.release -name '*.a'


#
# STEP 4
# Build something that links against V8.
#
# This isn't really a step, but it uses the built V8 in a Go program that links against it to show
# that it worked.
#
FROM golang:1.19.3-alpine3.16

COPY --from=v8 /tmp/v8/include /tmp/v8/include
COPY --from=v8 /tmp/v8/out.gn/x64.release/obj /tmp/v8/lib

RUN \
  apk add --update git alpine-sdk && \
  CGO_CXXFLAGS="-I/tmp/v8/include" CGO_LDFLAGS="-L/tmp/v8/lib" go install oss.terrastruct.com/d2/cmd/d2@v0.0.13

RUN which d2
RUN d2 --help

CMD ["d2"]
