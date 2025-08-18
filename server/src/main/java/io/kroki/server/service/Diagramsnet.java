package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;

import java.util.Arrays;
import java.util.List;

public class Diagramsnet implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG);

  private final Delegator delegator;
  private final String host;
  private final int port;
  private final SourceDecoder sourceDecoder;

  public Diagramsnet(Vertx vertx, JsonObject config, Delegator delegator) {
    this.delegator = delegator;
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
    this.host = config.getString("KROKI_DIAGRAMSNET_HOST", "127.0.0.1");
    this.port = config.getInteger("KROKI_DIAGRAMSNET_PORT", 8005);
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
    return "16.2.4";
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    String requestURI = "/" + serviceName + "/" + fileFormat.getName();
    Future<HttpResponse<Buffer>> httpResponseFuture = this.delegator.delegate(host, port, requestURI, sourceDecoded, options);
    return Delegator.handle(host, port, requestURI, httpResponseFuture);
  }
}
