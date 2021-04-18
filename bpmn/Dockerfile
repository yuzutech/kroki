# Package the Node.js project into a single binary
FROM node:12.19.0-alpine3.11 as builder

# Workaround: https://github.com/nodejs/docker-node/issues/813#issuecomment-407339011
# Error: could not get uid/gid
# [ 'nobody', 0 ]
RUN npm config set unsafe-perm true

# Workaround: https://github.com/vercel/pkg-fetch/issues/165
# use pkg-fetch 2.6.0 because alpine binaries are not available on pkg-fetch 3.x
RUN npm install -g pkg@4.5.1 pkg-fetch@2.6.0

ENV NODE node10
ENV PLATFORM alpine
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch -n ${NODE} -p ${PLATFORM} -a ${ARCH}

WORKDIR /app

COPY package.json package-lock.json /app/
COPY src /app/src

RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 npm ci
RUN npm run lint

RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin

# Create the image
FROM alpine:3.13.5

RUN addgroup -g 1000 kroki && adduser -D -G kroki -u 1000 kroki

RUN apk add --no-cache --update chromium

COPY --from=builder /app/app.bin /usr/bin/bpmn
COPY --chown=kroki:kroki assets /usr/local/kroki/assets

ENV KROKI_BPMN_PAGE_URL=file:///usr/local/kroki/assets/index.html
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chrome

EXPOSE 8003

USER kroki

ENTRYPOINT ["/usr/bin/bpmn"]
