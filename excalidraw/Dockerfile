FROM node:22.16-alpine3.21 AS builder

COPY assets ./assets
COPY package*.json ./

RUN npm i
RUN npm run build

FROM node:22.16-alpine3.21

RUN addgroup -g 1001 kroki && adduser -D -G kroki -u 1001 kroki

RUN apk add --quiet --no-cache --update \
  chromium \
  font-noto-cjk

USER kroki
WORKDIR /usr/local/kroki/

RUN mkdir -p /usr/local/kroki/node && chown kroki:kroki -R /usr/local/kroki

ENV KROKI_EXCALIDRAW_PAGE_URL=file:///usr/local/kroki/assets/index.html
ENV KROKI_EXCALIDRAW_ASSET_PATH=
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chrome
#ENV DEBUG="puppeteer:*"
ENV LEVEL="info"
ENV XDG_CONFIG_HOME="/tmp/config"
ENV XDG_CACHE_HOME="/tmp/cache"

COPY --chown=kroki:kroki src ./src
COPY --chown=kroki:kroki package*.json ./
COPY --chown=kroki:kroki assets ./assets
COPY --from=builder --chown=kroki:kroki ./assets/index.bundle.js ./assets/index.bundle.js

RUN npm i --omit=dev

EXPOSE 8004

ENTRYPOINT ["node", "src/index.js"]
