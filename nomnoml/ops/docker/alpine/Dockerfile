FROM node:10.15.0-alpine

RUN npm install -g pkg pkg-fetch
ENV NODE node10
ENV PLATFORM alpine
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch ${NODE} ${PLATFORM} ${ARCH}

COPY index.js package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin
