FROM node:10.22.0-alpine3.11

# Workaround: https://github.com/nodejs/docker-node/issues/813#issuecomment-407339011
# Error: could not get uid/gid
# [ 'nobody', 0 ]
RUN npm config set unsafe-perm true

# system dependencies for "canvas" Node package
# https://github.com/Automattic/node-canvas/issues/866
RUN apk add --no-cache \
        build-base \
        g++ \
        cairo-dev \
        jpeg-dev \
        pango-dev \
        giflib-dev

RUN npm install -g pkg pkg-fetch
ENV NODE node10
ENV PLATFORM alpine
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch ${NODE} ${PLATFORM} ${ARCH}

COPY index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin
RUN cp /app/node_modules/canvas/build/Release/canvas.node  /app/
