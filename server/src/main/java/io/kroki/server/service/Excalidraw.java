package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.response.Caching;
import io.kroki.server.response.DiagramResponse;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.WebClient;

import java.util.Collections;
import java.util.List;

public class Excalidraw implements DiagramService {

  private final WebClient client;
  private final String host;
  private final int port;
  private final SourceDecoder sourceDecoder;
  private final DiagramResponse diagramResponse;

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
    this.diagramResponse = new DiagramResponse(new Caching("0.1.0"));
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
  public void convert(RoutingContext routingContext, String sourceDecoded, String serviceName, FileFormat fileFormat) {
    Delegator.delegate(client, routingContext, diagramResponse, host, port, "/" + serviceName + "/" + fileFormat.getName(), sourceDecoded);
  }
}
