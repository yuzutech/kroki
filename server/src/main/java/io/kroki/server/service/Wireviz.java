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

import java.util.Arrays;
import java.util.List;

public class Wireviz implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG);

  private final WebClient client;
  private final SourceDecoder sourceDecoder;
  private final String host;
  private final int port;

  public Wireviz(Vertx vertx, JsonObject config) {
    this.client = WebClient.create(vertx);
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
    this.host = config.getString("KROKI_WIREVIZ_HOST", "127.0.0.1");
    this.port = config.getInteger("KROKI_WIREVIZ_PORT", 8006);
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
    return "undefined";
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    String requestURI = "/" + serviceName + "/" + fileFormat.getName();
    Handler<AsyncResult<HttpResponse<Buffer>>> responseHandler = Delegator.createHandler(host, port, requestURI, handler);
    Delegator.delegate(client, host, port, requestURI, sourceDecoded, options, responseHandler);
  }
}
