package io.kroki.server.service;

import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;

public class Delegator {

  public static void delegate(WebClient client, HttpServerResponse response, int port, String requestURI) {
    client
      .get(port, "127.0.0.1", requestURI)
      .send(result -> {
        if (result.succeeded()) {
          HttpResponse<Buffer> httpResponse = result.result();
          if (httpResponse.statusCode() == 200) {
            if (!response.closed()) {
              response
                .putHeader("Content-Type", httpResponse.getHeader("Content-Type"))
                .end(httpResponse.body());
            }
          } else {
            if (!response.closed()) {
              response
                .setStatusCode(httpResponse.statusCode())
                .end(httpResponse.body());
            }
          }
        } else {
          if (!response.closed()) {
            response
              .setStatusCode(500)
              .end(result.cause().getMessage());
          }
        }
      });
  }
}
