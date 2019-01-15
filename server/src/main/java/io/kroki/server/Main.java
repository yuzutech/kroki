package io.kroki.server;

import io.vertx.core.Vertx;

public class Main {

  public static void main(String[] args) {
    Vertx vertx = Vertx.vertx();
    KrokiVerticle.start(vertx, result -> {
    });
  }

}
