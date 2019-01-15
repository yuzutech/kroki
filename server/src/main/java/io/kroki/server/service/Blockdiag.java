package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.WebClient;

public class Blockdiag {

  private final WebClient client;

  public Blockdiag(Vertx vertx) {
    this.client = WebClient.create(vertx);
  }

  public Handler<RoutingContext> convertRoute() {
    return routingContext -> Delegator.delegate(client, routingContext.response(), 8001, routingContext.normalisedPath());
  }
}
