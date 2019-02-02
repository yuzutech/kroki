package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class Erd implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG);

  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;

  public Erd(Vertx vertx, JsonObject config) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_ERD_BIN_PATH", "dot");
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
  }

  @Override
  public List<FileFormat> getSupportedFormats() {
    return SUPPORTED_FORMATS;
  }

  @Override
  public SourceDecoder getSourceDecoder() {
    return sourceDecoder;
  }

  @Override
  public void convert(RoutingContext routingContext, String sourceDecoded, FileFormat fileFormat) {
    HttpServerResponse response = routingContext.response();
    vertx.executeBlocking(future -> {
      try {
        byte[] result = erd(sourceDecoded.getBytes(), fileFormat.getName());
        future.complete(result);
      } catch (IOException | InterruptedException | IllegalStateException e) {
        future.fail(e);
      }
    }, res -> {
      if (res.failed()) {
        routingContext.fail(res.cause());
        return;
      }
      byte[] result = (byte[]) res.result();
      response
        .putHeader("Content-Type", ContentType.get(fileFormat))
        .end(Buffer.buffer(result));
    });
  }

  private byte[] erd(byte[] source, String format) throws IOException, InterruptedException, IllegalStateException {
    // Supported format: bmp, dot, eps, gif, jpg, pdf, plain, png, ps, ps2, svg, tiff
    return Commander.execute(source, binPath, "--fmt=" + format);
  }
}
