package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.security.SafeMode;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;

import java.util.Collections;
import java.util.List;

public class Excalidraw implements DiagramService {

  private final Delegator delegator;
  private final String host;
  private final int port;
  private final SourceDecoder sourceDecoder;
  private final SafeMode safeMode;

  public Excalidraw(Vertx vertx, JsonObject config, Delegator delegator) {
    this.delegator = delegator;
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
    this.host = config.getString("KROKI_EXCALIDRAW_HOST", "127.0.0.1");
    this.port = config.getInteger("KROKI_EXCALIDRAW_PORT", 8004);
    this.safeMode = SafeMode.get(config.getString("KROKI_EXCALIDRAW_SAFE_MODE", config.getString("KROKI_SAFE_MODE", "secure")), SafeMode.SECURE);
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
    // renovate: datasource=npm depName=@excalidraw/excalidraw
    return "0.18.1";
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    String requestURI = "/" + serviceName + "/" + fileFormat.getName();
    // Force the safe mode on every request: the companion's Chromium process must not load
    // network resources embedded in the diagram unless this deployment explicitly opted out.
    // "safeMode" can't be spoofed by the client: incoming request options are always lowercased
    // by DiagramHandler.getOptions before reaching here.
    options.put("safeMode", safeMode.name().toLowerCase());
    Future<HttpResponse<Buffer>> httpResponseFuture = this.delegator.delegate(host, port, requestURI, sourceDecoded, options);
    return Delegator.handle(host, port, requestURI, httpResponseFuture);
  }
}
