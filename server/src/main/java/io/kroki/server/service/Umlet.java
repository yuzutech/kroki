package io.kroki.server.service;

import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.umlet.UmletConverter;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class Umlet implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.SVG, FileFormat.PNG, FileFormat.JPEG);

  private final Vertx vertx;
  private final SourceDecoder sourceDecoder;

  public Umlet(Vertx vertx) {
    this.vertx = vertx;
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
  public String getVersion() {
    return "14.3.0";
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        byte[] result = UmletConverter.convert(sourceDecoded, fileFormat.getName());
        future.complete(result);
      } catch (IOException e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }
}
