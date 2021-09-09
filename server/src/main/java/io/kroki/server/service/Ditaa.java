package io.kroki.server.service;

import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import org.stathissideris.ditaa.core.CommandLineConverter;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Ditaa implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.SVG, FileFormat.PNG);
  private final SourceDecoder sourceDecoder;
  private final Vertx vertx;

  public Ditaa(Vertx vertx) {
    this.vertx = vertx;
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded, false);
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
    return "1.3.13";
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        convert(fileFormat, new ByteArrayInputStream(sourceDecoded.getBytes()), outputStream);
        future.complete(outputStream.toByteArray());
      } catch (IllegalStateException e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }

  static void convert(FileFormat fileFormat, InputStream inputStream, OutputStream outputStream) {
    List<String> args = new ArrayList<>();
    if (fileFormat.equals(FileFormat.SVG)) {
      args.add("--svg");
    }
    CommandLineConverter.convert(args.toArray(new String[0]), inputStream, outputStream);
  }
}
