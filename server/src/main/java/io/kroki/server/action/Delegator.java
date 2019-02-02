package io.kroki.server.action;

import io.kroki.server.error.BadRequestException;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;

public class Delegator {

  public static void delegate(WebClient client, RoutingContext routingContext, String host, int port, String requestURI) {
    client
      .get(port, host, requestURI)
      .send(result -> {
        if (result.succeeded()) {
          HttpResponse<Buffer> httpResponse = result.result();
          if (httpResponse.statusCode() == 200) {
            HttpServerResponse response = routingContext.response();
            if (!response.closed()) {
              response
                .putHeader("Content-Type", httpResponse.getHeader("Content-Type"))
                .end(httpResponse.body());
            }
          } else {
            routingContext.fail(new BadRequestException(httpResponse.body().toString()));
          }
        } else {
          routingContext.fail(result.cause());
        }
      });
  }
}
