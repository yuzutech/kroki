package io.kroki.server.service;

import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.UnsupportedFormatException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

import java.util.List;

public interface DiagramHandler {

  List<FileFormat> getSupportedFormats();

  SourceDecoder getSourceDecoder();

  default Handler<RoutingContext> convert() {
    return routingContext -> {
      FileFormat fileFormat = routingContext.get("output_file_format");
      String sourceEncoded = routingContext.request().getParam("source_encoded");
      String sourceDecoded = getSourceDecoder().decode(sourceEncoded);
      convert(routingContext, sourceDecoded, fileFormat);
    };
  }

  void convert(RoutingContext routingContext, String sourceDecoded, FileFormat fileFormat);

  default byte[] decode(String sourceEncoded, boolean trim) {
    return DiagramSource.decode(sourceEncoded, trim).getBytes();
  }

  default Handler<RoutingContext> validate() {
    return routingContext -> {
      String outputFormat = routingContext.request().getParam("output_format");
      String serviceName = routingContext.request().path().split("/")[1];
      try {
        FileFormat fileFormat = validate(serviceName, outputFormat);
        routingContext.put("output_file_format", fileFormat);
        routingContext.next();
      } catch (UnsupportedFormatException e) {
        routingContext.fail(e);
      }
    };
  }

  default FileFormat validate(String serviceName, String outputFormat) {
    FileFormat fileFormat = FileFormat.get(outputFormat);
    List<FileFormat> supportedFormats = getSupportedFormats();
    if (fileFormat == null || !supportedFormats.contains(fileFormat)) {
      throw new UnsupportedFormatException(outputFormat, serviceName, supportedFormats);
    }
    return fileFormat;
  }
}
