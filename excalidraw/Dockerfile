# Package the Node.js project into a single binary
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:16.18.1-alpine3.16 as builder

# Workaround: https://github.com/nodejs/docker-node/issues/813#issuecomment-407339011
# Error: could not get uid/gid
# [ 'nobody', 0 ]
RUN npm config set unsafe-perm true

RUN npm install -g pkg@5.6.0 pkg-fetch@3.3.0

ENV NODE node16
ENV PLATFORM alpine
RUN /usr/local/bin/pkg-fetch -n ${NODE} -p ${PLATFORM} -a $([ "$TARGETARCH" == "amd64" ] && echo "x64" || echo "$TARGETARCH")

COPY package.json package-lock.json /app/
COPY src /app/src
COPY assets /app/assets
WORKDIR /app

RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 npm ci
RUN npm run lint
RUN npm run prestart

RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-$([ "$TARGETARCH" == "amd64" ] && echo "x64" || echo "$TARGETARCH") . -o app.bin

# Create the image
FROM --platform=${TARGETPLATFORM:-linux/amd64} alpine:3.16.3

RUN addgroup -g 1000 kroki && adduser -D -G kroki -u 1000 kroki

RUN apk add --quiet --no-cache --update chromium

COPY --from=builder /app/app.bin /usr/bin/excalidraw
COPY --from=builder --chown=kroki:kroki /app/assets /usr/local/kroki/assets

ENV KROKI_EXCALIDRAW_PAGE_URL=file:///usr/local/kroki/assets/index.html
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chrome

EXPOSE 8004

USER kroki

ENTRYPOINT ["/usr/bin/excalidraw"]
