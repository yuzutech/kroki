FROM node:16.15.0-alpine3.15

# Workaround: https://github.com/nodejs/docker-node/issues/813#issuecomment-407339011
# Error: could not get uid/gid
# [ 'nobody', 0 ]
RUN npm config set unsafe-perm true

RUN npm install -g pkg@5.6.0 pkg-fetch@3.3.0

ENV NODE node16
ENV PLATFORM alpine
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch -n ${NODE} -p ${PLATFORM} -a ${ARCH}

COPY index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin
