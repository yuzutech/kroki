package io.kroki.server.service;

import io.kroki.server.action.Response;
import io.kroki.server.decode.DecodeException;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.kroki.umlet.UmletConverter;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class Umlet {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.SVG, FileFormat.PNG, FileFormat.JPEG);
  private static final String supportedFormatList = FileFormat.stringify(SUPPORTED_FORMATS);

  private final Vertx vertx;

  public Umlet(Vertx vertx) {
    this.vertx = vertx;
  }

  public Handler<RoutingContext> convertRoute() {
    return routingContext -> {
      HttpServerResponse response = routingContext.response();
      String outputFormat = routingContext.request().getParam("output_format");
      FileFormat fileFormat = FileFormat.get(outputFormat);
      if (fileFormat == null || !SUPPORTED_FORMATS.contains(fileFormat)) {
        Response.handleUnsupportedFormat(response, outputFormat, supportedFormatList);
        return;
      }
      vertx.executeBlocking(future -> {
        String sourceEncoded = routingContext.request().getParam("source_encoded");
        String sourceDecoded;
        try {
          sourceDecoded = DiagramSource.decode(sourceEncoded);
          try {
            byte[] result = UmletConverter.convert(sourceDecoded, fileFormat.getName());
            future.complete(result);
          } catch (IOException e) {
            future.fail(e);
          }
        } catch (DecodeException e) {
          future.fail(e);
        }
      }, res -> {
        if (res.failed()) {
          response
            .setStatusCode(400)
            .end(res.cause().getMessage());
          return;
        }
        byte[] result = (byte[]) res.result();
        response
          .putHeader("Content-Type", ContentType.get(fileFormat))
          .end(Buffer.buffer(result));
      });
    };
  }

}
