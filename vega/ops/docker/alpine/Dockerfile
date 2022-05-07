FROM node:16.15.0-alpine3.15

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

RUN npm install -g pkg@5.6.0 pkg-fetch@3.3.0

ENV NODE node16
ENV PLATFORM alpine
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch -n ${NODE} -p ${PLATFORM} -a ${ARCH}

COPY src /app/src
COPY tests /app/tests
COPY package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN npm run lint && npm t
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin
RUN cp /app/node_modules/canvas/build/Release/canvas.node  /app/
