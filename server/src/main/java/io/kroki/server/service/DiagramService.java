package io.kroki.server.service;

import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.format.FileFormat;
import io.vertx.ext.web.RoutingContext;

import java.util.List;

public interface DiagramService {

  List<FileFormat> getSupportedFormats();

  SourceDecoder getSourceDecoder();

  void convert(RoutingContext routingContext, String sourceDecoded, FileFormat fileFormat);
}
