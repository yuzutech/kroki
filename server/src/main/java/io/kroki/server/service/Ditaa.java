package io.kroki.server.service;

import io.kroki.server.decode.DecodeException;
import io.kroki.server.decode.DiagramSource;
import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;
import org.stathissideris.ascii2image.core.CommandLineConverter;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class Ditaa {

  public static Handler<RoutingContext> convertRoute() {
    return routingContext -> {
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
      convert(new ByteArrayInputStream(sourceDecoded), outputStream);
      response
        .putHeader("Content-Type", "image/png")
        .end(Buffer.buffer(outputStream.toByteArray()));
    };
  }

  private static void convert(InputStream inputStream, OutputStream outputStream) {
    String[] args = new String[]{};
    CommandLineConverter.convert(args, inputStream, outputStream);
  }
}
