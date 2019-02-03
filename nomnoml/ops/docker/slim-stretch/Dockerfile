FROM node:10.15.1-stretch-slim

RUN npm install -g pkg pkg-fetch
ENV NODE node10
ENV PLATFORM linux
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch ${NODE} ${PLATFORM} ${ARCH}

COPY . /app
WORKDIR /app

RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin
