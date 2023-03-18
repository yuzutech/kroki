package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;

import java.util.Collections;
import java.util.List;

public class Excalidraw implements DiagramService {

  private final WebClient client;
  private final String host;
  private final int port;
  private final SourceDecoder sourceDecoder;

  public Excalidraw(Vertx vertx, JsonObject config) {
    this.client = WebClient.create(vertx);
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
    this.host = config.getString("KROKI_EXCALIDRAW_HOST", "127.0.0.1");
    this.port = config.getInteger("KROKI_EXCALIDRAW_PORT", 8004);
  }

  @Override
  public List<FileFormat> getSupportedFormats() {
    return Collections.singletonList(FileFormat.SVG);
  }

  @Override
  public SourceDecoder getSourceDecoder() {
    return sourceDecoder;
  }

  @Override
  public String getVersion() {
    return "undefined";
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    String requestURI = "/" + serviceName + "/" + fileFormat.getName();
    Handler<AsyncResult<HttpResponse<Buffer>>> responseHandler = Delegator.createHandler(host, port, requestURI, handler);
    Delegator.delegate(client, host, port, requestURI, sourceDecoded, options, responseHandler);
  }
}
