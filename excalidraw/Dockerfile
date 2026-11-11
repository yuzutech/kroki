# Install the production dependencies with the npm CLI of the Node.js image:
# the runtime stage below starts from Alpine and only copies the node binary,
# so npm, npx, Yarn and corepack (and the packages they bundle) are not in any layer of the published image
FROM node:24.22-alpine3.24 AS deps

WORKDIR /usr/local/kroki/

# Shared package resolved through the file:../lib/browser-instance dependency
# ("lib" named build context, see docker-bake.hcl)
COPY --from=lib . /usr/local/lib/browser-instance

COPY package*.json ./

RUN PUPPETEER_SKIP_DOWNLOAD=true npm ci --omit=dev --no-audit --no-fund --no-update-notifier --loglevel=error

FROM node:24.22-alpine3.24 AS builder

WORKDIR /usr/local/kroki/

# Shared package resolved through the file:../lib/browser-instance dependency
# ("lib" named build context, see docker-bake.hcl)
COPY --from=lib . /usr/local/lib/browser-instance

COPY assets ./assets
COPY package*.json ./

RUN PUPPETEER_SKIP_DOWNLOAD=true npm ci --no-audit --no-fund --no-update-notifier --loglevel=error
RUN npm run prestart
RUN npm run build

FROM alpine:3.24

RUN addgroup -g 1001 kroki && adduser -D -G kroki -u 1001 kroki

# libstdc++ (and libgcc) are the only shared libraries the node binary needs besides musl
RUN apk add --quiet --no-cache --update \
  libstdc++ \
  chromium \
  font-noto-cjk \
  tini

COPY --from=deps /usr/local/bin/node /usr/local/bin/node

USER kroki
WORKDIR /usr/local/kroki/

RUN mkdir -p /usr/local/kroki/node && chown kroki:kroki -R /usr/local/kroki

ENV KROKI_EXCALIDRAW_ASSET_PATH=/public
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chrome
#ENV DEBUG="puppeteer:*"
ENV LEVEL="info"
ENV XDG_CONFIG_HOME="/tmp/config"
ENV XDG_CACHE_HOME="/tmp/cache"

COPY --chown=kroki:kroki src ./src
COPY --chown=kroki:kroki package*.json ./
COPY --chown=kroki:kroki assets ./assets
COPY --from=builder --chown=kroki:kroki /usr/local/kroki/assets/index.bundle.js ./assets/index.bundle.js
COPY --from=builder --chown=kroki:kroki /usr/local/kroki/assets/fonts ./assets/fonts

# Shared package resolved through the file:../lib/browser-instance dependency
# ("lib" named build context, see docker-bake.hcl)
COPY --from=lib --chown=kroki:kroki . /usr/local/lib/browser-instance

COPY --from=deps --chown=kroki:kroki /usr/local/kroki/node_modules ./node_modules

EXPOSE 8004

# tini runs as PID 1 to reap the Chromium processes orphaned by a crash, and forwards SIGTERM to Node.js
ENTRYPOINT ["/sbin/tini", "-s", "--", "node", "src/index.js"]
