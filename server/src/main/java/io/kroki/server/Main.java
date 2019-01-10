package io.kroki.server;

import io.vertx.core.Vertx;
import io.vertx.core.net.NetClient;
import io.vertx.core.net.NetSocket;

public class Main {

  public static void main(String[] args) {
    Vertx vertx = Vertx.vertx();
    vertx.createHttpServer().requestHandler(req -> {
      req.response()
        .putHeader("content-type", "text/plain")
        .end("Hello from Vert.x!");
    }).listen(8080);


    NetClient client = vertx.createNetClient();
    client.connect(4321, "localhost", res -> {
      if (res.succeeded()) {
        System.out.println("Connected!");
        NetSocket socket = res.result();
      } else {
        System.out.println("Failed to connect: " + res.cause().getMessage());
      }
    });
  }
}
