# based on alpine 3.11
FROM adoptopenjdk/openjdk11:jre-11.0.6_10-alpine

COPY --from=kroki-builder-static-svgbob:latest /home/rust/.cargo/bin/svgbob /rust/bin/svgbob
COPY --from=kroki-builder-static-erd:latest /root/.local/bin/erd /haskell/bin/erd
COPY --from=kroki-builder-nomnoml:latest /app/app.bin /node/bin/nomnoml
COPY --from=kroki-builder-vega:latest /app/app.bin /node/bin/vega
COPY --from=kroki-builder-vega:latest /app/canvas.node /node/bin/canvas.node
COPY --from=kroki-builder-wavedrom:latest /app/app.bin /node/bin/wavedrom

RUN apk add --update --no-cache \
           libjpeg \
           giflib-dev \
           graphviz \
           ttf-freefont

COPY ops/docker/logback.xml /etc/logback.xml

ENV KROKI_SAFE_MODE=secure
ENV KROKI_SVGBOB_BIN_PATH=/rust/bin/svgbob
ENV KROKI_ERD_BIN_PATH=/haskell/bin/erd
ENV KROKI_DOT_BIN_PATH=/usr/bin/dot
ENV KROKI_NOMNOML_BIN_PATH=/node/bin/nomnoml
ENV KROKI_VEGA_BIN_PATH=/node/bin/vega
ENV KROKI_WAVEDROM_BIN_PATH=/node/bin/wavedrom
ENV JAVA_OPTS="-Dlogback.configurationFile=/etc/logback.xml"

EXPOSE 8000

COPY target/kroki-server.jar .

ENTRYPOINT exec java $JAVA_OPTS -jar kroki-server.jar
