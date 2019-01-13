package io.kroki.server.service;

import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.WebClient;

public class Asciitosvg {

  private final WebClient client;

  public Asciitosvg(Vertx vertx) {
    this.client = WebClient.create(vertx);
  }

  public Handler<RoutingContext> convertRoute() {
    return routingContext -> {
      String sourceEncoded = routingContext.request().getParam("source_encoded");
      String outputFormat = routingContext.request().getParam("output_format");
      HttpServerResponse response = routingContext.response();
      if (!outputFormat.toLowerCase().equals("svg")) {
        response
          .setStatusCode(400)
          .end("Unsupported output format: " + outputFormat + ". Only svg format is available for asciitosvg.");
        return;
      }
      Delegator.delegate(client, routingContext.response(), 8002, "/asciitosvg/" + sourceEncoded);
    };
  }
}

