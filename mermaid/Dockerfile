FROM node:18.16-alpine3.18

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

COPY --chown=kroki:kroki src ./src
COPY --chown=kroki:kroki package*.json ./
COPY --chown=kroki:kroki assets ./assets

RUN npm i --omit=dev

EXPOSE 8002

ENTRYPOINT ["node", "src/index.js"]
