package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.kroki.server.action.Response;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.WebClient;

import java.util.Collections;
import java.util.List;

public class Asciitosvg {

  private static final List<FileFormat> SUPPORTED_FORMATS = Collections.singletonList(FileFormat.SVG);
  private static final String supportedFormatList = FileFormat.stringify(SUPPORTED_FORMATS);

  private final WebClient client;

  public Asciitosvg(Vertx vertx) {
    this.client = WebClient.create(vertx);
  }

  public Handler<RoutingContext> convertRoute() {
    return routingContext -> {
      String sourceEncoded = routingContext.request().getParam("source_encoded");
      String outputFormat = routingContext.request().getParam("output_format");
      HttpServerResponse response = routingContext.response();
      FileFormat fileFormat = FileFormat.get(outputFormat);
      if (fileFormat == null || !SUPPORTED_FORMATS.contains(fileFormat)) {
        Response.handleUnsupportedFormat(response, outputFormat, supportedFormatList);
        return;
      }
      Delegator.delegate(client, routingContext.response(), 8002, "/asciitosvg/" + sourceEncoded);
    };
  }
}

