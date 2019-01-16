package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.action.Response;
import io.kroki.server.decode.DecodeException;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class Svgbob {

  private static final List<FileFormat> SUPPORTED_FORMATS = Collections.singletonList(FileFormat.SVG);
  private static final String supportedFormatList = FileFormat.stringify(SUPPORTED_FORMATS);

  private final Vertx vertx;
  private final String binPath;

  public Svgbob(Vertx vertx, JsonObject config) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_SVGBOB_BIN_PATH", "svgbob");
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
        try {
          String sourceEncoded = routingContext.request().getParam("source_encoded");
          byte[] sourceDecoded;
          try {
            sourceDecoded = DiagramSource.decode(sourceEncoded, false).getBytes();
            byte[] result = svgbob(sourceDecoded, fileFormat.getName());
            future.complete(result);
          } catch (DecodeException e) {
            future.fail(e);
          }
        } catch (IOException | InterruptedException | IllegalStateException e) {
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

  private byte[] svgbob(byte[] source, String format) throws IOException, InterruptedException, IllegalStateException {
    return Commander.execute(source, binPath);
  }
}
