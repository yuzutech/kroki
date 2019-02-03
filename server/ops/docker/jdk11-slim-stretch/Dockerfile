FROM openjdk:11.0.1-jdk-slim-stretch

COPY --from=kroki-builder-static-svgbob:0.4.1 /home/rust/src/svgbob_cli/target/x86_64-unknown-linux-musl/release/svgbob /rust/bin/svgbob
COPY --from=kroki-builder-static-erd:0.1.3.0 /erd/dist/build/erd/erd /haskell/bin/erd
COPY --from=kroki-builder-nomnoml:0.3.0 /app/app.bin /node/bin/nomnoml

ENV KROKI_SVGBOB_BIN_PATH=/rust/bin/svgbob
ENV KROKI_ERD_BIN_PATH=/haskell/bin/erd
ENV KROKI_DOT_BIN_PATH=/usr/bin/dot
ENV KROKI_NOMNOML_BIN_PATH=/node/bin/nomnoml

RUN apt-get update && apt-get install graphviz ttf-freefont -y

COPY target/kroki-server.jar .

EXPOSE 8000

ENTRYPOINT ["java", "-jar", "kroki-server.jar"]
