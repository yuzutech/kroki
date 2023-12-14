FROM node:18.18-alpine3.18

LABEL \
    org.opencontainers.image.title="Kroki - Excalidraw" \
    org.opencontainers.image.description="Kroki provides a unified API supporting multiple diagramming formats, making it easy to create diagrams from textual descriptions." \
    org.opencontainers.image.url="https://kroki.io" \
    org.opencontainers.image.source="https://github.com/yuzutech/kroki" \
    org.opencontainers.image.licenses="MIT"

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

COPY --chown=kroki:kroki src ./src
COPY --chown=kroki:kroki package*.json ./
COPY --chown=kroki:kroki assets ./assets

RUN npm i --omit=dev

EXPOSE 8004

ENTRYPOINT ["node", "src/index.js"]
