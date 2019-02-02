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
import java.util.Collections;
import java.util.List;

public class Nomnoml implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Collections.singletonList(FileFormat.SVG);
  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;

  public Nomnoml(Vertx vertx, JsonObject config) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_NOMNOML_BIN_PATH", "nomnoml");
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
        byte[] result = nomnoml(sourceDecoded.getBytes());
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

  private byte[] nomnoml(byte[] source) throws IOException, InterruptedException, IllegalStateException {
    return Commander.execute(source, binPath);
  }
}
