FROM openjdk:8u191-jdk-alpine3.8

COPY --from=kroki-builder-static-svgbob:latest /home/rust/.cargo/bin/svgbob /rust/bin/svgbob
COPY --from=kroki-builder-static-erd:latest /root/.local/bin/erd /haskell/bin/erd
COPY --from=kroki-builder-nomnoml:latest /app/app.bin /node/bin/nomnoml

RUN apk add --update --no-cache \
           graphviz \
           ttf-freefont

# Workaround: https://github.com/docker-library/openjdk/issues/77
# Error loading shared library libjli.so: No such file or directory (needed by /usr/bin/java)
# Error relocating /usr/bin/java: JLI_Launch: symbol not found
COPY ops/docker/ld-musl-x86_64.path /etc/ld-musl-x86_64.path

COPY ops/docker/logback.xml /etc/logback.xml

ENV KROKI_SAFE_MODE=secure
ENV KROKI_SVGBOB_BIN_PATH=/rust/bin/svgbob
ENV KROKI_ERD_BIN_PATH=/haskell/bin/erd
ENV KROKI_DOT_BIN_PATH=/usr/bin/dot
ENV KROKI_NOMNOML_BIN_PATH=/node/bin/nomnoml
ENV JAVA_OPTS="-Dlogback.configurationFile=/etc/logback.xml"

EXPOSE 8000

COPY target/kroki-server.jar .

ENTRYPOINT exec java $JAVA_OPTS -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -jar kroki-server.jar
