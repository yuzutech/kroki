package io.kroki.server.service;

import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;
import org.stathissideris.ascii2image.core.CommandLineConverter;

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

  public Ditaa() {
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
  public void convert(RoutingContext routingContext, String sourceDecoded, FileFormat fileFormat) {
    HttpServerResponse response = routingContext.response();
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    convert(fileFormat, new ByteArrayInputStream(sourceDecoded.getBytes()), outputStream);
    response
      .putHeader("Content-Type", ContentType.get(fileFormat))
      .end(Buffer.buffer(outputStream.toByteArray()));
  }

  private static void convert(FileFormat fileFormat, InputStream inputStream, OutputStream outputStream) {
    List<String> args = new ArrayList<>();
    if (fileFormat.equals(FileFormat.SVG)) {
      args.add("--svg");
    }
    CommandLineConverter.convert(args.toArray(new String[0]), inputStream, outputStream);
  }
}
