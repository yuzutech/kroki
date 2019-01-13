package io.kroki.server;

import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.Router;
import net.sourceforge.plantuml.FileFormat;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;

public class Main {

  public static void main(String[] args) {
    Vertx vertx = Vertx.vertx();

    HttpServer server = vertx.createHttpServer();
    Router router = Router.router(vertx);

    router.route("/plantuml/:output_format/:source_encoded").handler(routingContext -> {
      HttpServerResponse response = routingContext.response();
      String sourceEncoded = routingContext.request().getParam("source_encoded");
      String outputFormat = routingContext.request().getParam("output_format");
      FileFormat fileFormat = FileFormat.valueOf(outputFormat.toUpperCase());
      String sourceDecoded;
      try {
        sourceDecoded = Plantuml.decode(sourceEncoded);
      } catch (DecodeException | UnsupportedEncodingException e) {
        response
          .setStatusCode(400)
          .end(e.getMessage());
        return;
      }
      byte[] data = Plantuml.convert(sourceDecoded, fileFormat);
      response
        .putHeader("Content-Type", Plantuml.CONTENT_TYPE.get(fileFormat))
        .end(Buffer.buffer(data));
    });
    router.route("/ditaa/:output_format/:source_encoded").handler(routingContext -> {
      HttpServerResponse response = routingContext.response();
      String sourceEncoded = routingContext.request().getParam("source_encoded");
      // String outputFormat = routingContext.request().getParam("output_format");
      byte[] sourceDecoded;
      try {
        sourceDecoded = DiagramSource.decode(sourceEncoded).getBytes();
      } catch (DecodeException e) {
        response
          .setStatusCode(400)
          .end(e.getMessage());
        return;
      }
      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      Ditaa.convert(new ByteArrayInputStream(sourceDecoded), outputStream);
      response
        .putHeader("Content-Type", "image/png")
        .end(Buffer.buffer(outputStream.toByteArray()));
    });
    server.requestHandler(router).listen(8080);
  }
}
