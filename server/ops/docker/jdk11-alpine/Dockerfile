FROM adoptopenjdk/openjdk11:jdk-11.0.2.9-alpine-slim

COPY --from=kroki-builder-static-svgbob:0.4.1 /home/rust/src/svgbob_cli/target/x86_64-unknown-linux-musl/release/svgbob /rust/bin/svgbob
COPY --from=kroki-builder-static-erd:0.1.3.0 /erd/dist/build/erd/erd /haskell/bin/erd
COPY --from=kroki-builder-nomnoml:0.3.0 /app/app.bin /node/bin/nomnoml

ENV KROKI_SVGBOB_BIN_PATH=/rust/bin/svgbob
ENV KROKI_ERD_BIN_PATH=/haskell/bin/erd
ENV KROKI_DOT_BIN_PATH=/usr/bin/dot
ENV KROKI_NOMNOML_BIN_PATH=/node/bin/nomnoml

RUN apk add --update --no-cache \
           graphviz \
           ttf-freefont

COPY target/kroki-server.jar .

# Workaround: https://github.com/docker-library/openjdk/issues/77
# Error loading shared library libjli.so: No such file or directory (needed by /usr/bin/java)
# Error relocating /usr/bin/java: JLI_Launch: symbol not found
COPY ops/docker/ld-musl-x86_64.path /etc/ld-musl-x86_64.path

EXPOSE 8000

ENTRYPOINT ["java", "-jar", "kroki-server.jar"]
