package io.kroki.server.service;

import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.format.FileFormat;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface DiagramService {

  List<FileFormat> getSupportedFormats();

  SourceDecoder getSourceDecoder();

  String getVersion();

  Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options);
}
