package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.WebClient;

import java.util.Arrays;
import java.util.List;

public class Blockdiag implements DiagramHandler {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.PDF);

  private final WebClient client;
  private final SourceDecoder sourceDecoder;

  public Blockdiag(Vertx vertx) {
    this.client = WebClient.create(vertx);
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) {
        return encoded; // will be decoded by the backend
      }
    };
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
    Delegator.delegate(client, routingContext.response(), 8001, routingContext.normalisedPath());
  }
}
