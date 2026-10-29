# Copy the Mermaid bundles from node_modules into assets/mermaid (they are devDependencies,
# so the runtime stage does not install them)
FROM node:24.19-alpine3.24 AS builder

WORKDIR /usr/local/kroki/

# Shared package resolved through the file:../lib/browser-instance dependency
# ("lib" named build context, see docker-bake.hcl)
COPY --from=lib . /usr/local/lib/browser-instance

COPY package*.json ./

RUN PUPPETEER_SKIP_DOWNLOAD=true npm i --no-audit --no-fund --no-update-notifier --loglevel=error
RUN npm run prestart

FROM node:24.19-alpine3.24

RUN addgroup -g 1001 kroki && adduser -D -G kroki -u 1001 kroki

RUN apk add --quiet --no-cache --update \
  chromium \
  font-noto-cjk

RUN mkdir -p /usr/share/fonts/truetype/google-fonts
COPY --chown=kroki:kroki fonts /usr/share/fonts/truetype/google-fonts
RUN fc-cache -f && rm -rf /var/cache/*

RUN mkdir -p /usr/local/kroki/node && chown kroki:kroki -R /usr/local/kroki

USER kroki
WORKDIR /usr/local/kroki/

ENV KROKI_MERMAID_PAGE_URL=file:///usr/local/kroki/assets/index.html
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chrome
#ENV DEBUG="puppeteer:*"
ENV LEVEL="info"
ENV XDG_CONFIG_HOME="/tmp/config"
ENV XDG_CACHE_HOME="/tmp/cache"

COPY --chown=kroki:kroki src ./src
COPY --chown=kroki:kroki package*.json ./
COPY --chown=kroki:kroki assets ./assets
COPY --from=builder --chown=kroki:kroki /usr/local/kroki/assets/mermaid ./assets/mermaid

# Shared package resolved through the file:../lib/browser-instance dependency
# ("lib" named build context, see docker-bake.hcl)
COPY --from=lib --chown=kroki:kroki . /usr/local/lib/browser-instance

RUN npm i --omit=dev --no-audit --no-fund --no-update-notifier --loglevel=error

EXPOSE 8002

ENTRYPOINT ["node", "src/index.js"]
