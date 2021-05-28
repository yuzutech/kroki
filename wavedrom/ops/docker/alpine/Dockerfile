FROM node:16.2.0-alpine3.11

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

COPY index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN npm run lint
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin
