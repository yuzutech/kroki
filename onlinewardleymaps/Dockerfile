FROM node:18.18-alpine3.18 as base

RUN addgroup -g 1001 kroki && adduser -D -G kroki -u 1001 kroki
RUN apk add --quiet --no-cache --update git \
    supervisor \
    chromium \
    font-noto-cjk

WORKDIR /server
RUN git clone https://github.com/damonsk/onlinewardleymaps.git ./ && \
    git checkout 44ce638d9a1bef6e629301a840280a904cbc20e4

WORKDIR /server/frontend
RUN yarn install
COPY assets/patch* assets/aws-exports.js ./
RUN git apply patch1.diff && \
    yarn build

WORKDIR /service

ENV KROKI_ONLINEWARDLEYMAPS_PAGE_URL="http://localhost:3000"
# 15 seconds
ENV KROKI_ONLINEWARDLEYMAPS_CONVERT_TIMEOUT=15000
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chrome
#ENV DEBUG="puppeteer:*"
ENV LEVEL="info"

COPY --chown=kroki:kroki package*.json ./
RUN npm i --omit=dev
COPY --chown=kroki:kroki src ./

RUN mkdir -p /app && chown -R kroki:kroki /app
COPY --chown=kroki:kroki assets/supervisord.conf /app/supervisord.conf

WORKDIR /app
USER kroki

EXPOSE 8007

ENTRYPOINT ["supervisord", "-c", "/app/supervisord.conf"]
