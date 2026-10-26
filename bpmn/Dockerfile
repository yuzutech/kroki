# Copy the bpmn-js viewer bundle from node_modules into assets
FROM node:24.19-alpine3.24 AS builder

WORKDIR /usr/local/kroki/

# Shared package resolved through the file:../lib/browser-instance dependency
# ("lib" named build context, see docker-bake.hcl)
COPY --from=lib . /usr/local/lib/browser-instance

COPY package*.json ./

RUN PUPPETEER_SKIP_DOWNLOAD=true npm i --omit=dev
RUN mkdir -p assets && npm run prestart

FROM node:24.19-alpine3.24

RUN addgroup -g 1001 kroki && adduser -D -G kroki -u 1001 kroki

RUN apk add --quiet --no-cache --update \
  chromium \
  font-noto-cjk

USER kroki
WORKDIR /usr/local/kroki/

RUN mkdir -p /usr/local/kroki/node && chown kroki:kroki -R /usr/local/kroki

ENV KROKI_BPMN_PAGE_URL=file:///usr/local/kroki/assets/index.html
# 15 seconds
ENV KROKI_BPMN_CONVERT_TIMEOUT=15000
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chrome
#ENV DEBUG="puppeteer:*"
ENV LEVEL="info"
ENV XDG_CONFIG_HOME="/tmp/config"
ENV XDG_CACHE_HOME="/tmp/cache"

COPY --chown=kroki:kroki src ./src
COPY --chown=kroki:kroki package*.json ./
COPY --chown=kroki:kroki assets ./assets
COPY --from=builder --chown=kroki:kroki /usr/local/kroki/assets/bpmn-viewer.production.min.js ./assets/bpmn-viewer.production.min.js

# Shared package resolved through the file:../lib/browser-instance dependency
# ("lib" named build context, see docker-bake.hcl)
COPY --from=lib --chown=kroki:kroki . /usr/local/lib/browser-instance

RUN npm i --omit=dev

EXPOSE 8003

ENTRYPOINT ["node", "src/index.js"]
