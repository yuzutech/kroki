package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.WebClient;

import java.util.Arrays;
import java.util.List;

public class Blockdiag implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.PDF);

  private final WebClient client;
  private final SourceDecoder sourceDecoder;
  private final String host;
  private final int port;

  public Blockdiag(Vertx vertx, JsonObject config) {
    this.client = WebClient.create(vertx);
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) {
        return encoded; // will be decoded by the backend
      }
    };
    this.host = config.getString("KROKI_BLOCKDIAG_HOST", "127.0.0.1");
    this.port = config.getInteger("KROKI_BLOCKDIAG_PORT", 8001);
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
  public void convert(RoutingContext routingContext, String sourceEncoded, FileFormat fileFormat) {
    Delegator.delegate(client, routingContext.response(), host, port, routingContext.normalisedPath());
  }
}
