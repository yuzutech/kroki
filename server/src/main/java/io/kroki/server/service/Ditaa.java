package io.kroki.server.service;

import io.kroki.server.action.Response;
import io.kroki.server.decode.DecodeException;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Handler;
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

public class Ditaa {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.SVG, FileFormat.PNG);
  private static final String supportedFormatList = FileFormat.stringify(SUPPORTED_FORMATS);

  public static Handler<RoutingContext> convertRoute() {
    return routingContext -> {
      HttpServerResponse response = routingContext.response();
      String sourceEncoded = routingContext.request().getParam("source_encoded");
      String outputFormat = routingContext.request().getParam("output_format");
      FileFormat fileFormat = FileFormat.get(outputFormat);
      if (fileFormat == null || !SUPPORTED_FORMATS.contains(fileFormat)) {
        Response.handleUnsupportedFormat(response, outputFormat, supportedFormatList);
        return;
      }
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
      convert(fileFormat, new ByteArrayInputStream(sourceDecoded), outputStream);
      response
        .putHeader("Content-Type", "image/png")
        .end(Buffer.buffer(outputStream.toByteArray()));
    };
  }

  private static void convert(FileFormat fileFormat, InputStream inputStream, OutputStream outputStream) {
    List<String> args = new ArrayList<>();
    if (fileFormat.equals(FileFormat.SVG)) {
      args.add("--svg");
    }
    CommandLineConverter.convert(args.toArray(new String[0]), inputStream, outputStream);
  }
}
