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
    return "1.0.3";
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        convert(fileFormat, options, new ByteArrayInputStream(sourceDecoded.getBytes()), outputStream);
        future.complete(outputStream.toByteArray());
      } catch (IllegalStateException e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }

  static void convert(FileFormat fileFormat, JsonObject options, InputStream inputStream, OutputStream outputStream) {
    List<String> args = new ArrayList<>();
    if (fileFormat.equals(FileFormat.SVG)) {
      args.add("--svg");
    }
    String noAntialias = options.getString("no-antialias");
    if (noAntialias != null) {
      args.add("--no-antialias");
    }
    String noSeparation = options.getString("no-separation");
    if (noSeparation != null) {
      args.add("--no-separation");
    }
    String roundCorners = options.getString("round-corners");
    if (roundCorners != null) {
      args.add("--round-corners");
    }
    String scale = options.getString("scale");
    if (scale != null) {
      args.add("--scale " + scale);
    }
    String noShadows = options.getString("no-shadows");
    if (noShadows != null) {
      args.add("--no-shadows");
    }
    String tabs = options.getString("tabs");
    if (tabs != null) {
      args.add("--tabs " + tabs);
    }
    CommandLineConverter.convert(args.toArray(new String[0]), inputStream, outputStream);
  }
}
