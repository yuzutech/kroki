FROM node:10.15.0-alpine

RUN npm install -g pkg pkg-fetch
ENV NODE node10
ENV PLATFORM alpine
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch ${NODE} ${PLATFORM} ${ARCH}

COPY . /app
WORKDIR /app

RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} . -o app.bin
