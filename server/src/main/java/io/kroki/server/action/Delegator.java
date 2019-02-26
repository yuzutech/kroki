package io.kroki.server.action;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.ServiceUnavailableException;
import io.kroki.server.log.Logging;
import io.netty.handler.codec.http.HttpHeaderValues;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.ConnectException;

public class Delegator {

  private static final Logger logger = LoggerFactory.getLogger(Delegator.class);
  private static final Logging logging = new Logging(logger);

  public static void delegate(WebClient client, RoutingContext routingContext, String host, int port, String requestURI, String body) {
    client
      .post(port, host, requestURI)
      .putHeader(HttpHeaders.ACCEPT.toString(), HttpHeaderValues.APPLICATION_JSON.toString())
      .sendBuffer(Buffer.buffer(body), result -> {
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
            logging.delegate(httpResponse, host, port, requestURI);
            String contentType = httpResponse.getHeader(HttpHeaders.CONTENT_TYPE.toString());
            if (HttpHeaderValues.TEXT_PLAIN.contentEquals(contentType) || HttpHeaderValues.APPLICATION_JSON.contentEquals(contentType)) {
              routingContext.fail(new BadRequestException(httpResponse.body().toString()));
            } else {
              routingContext.fail(httpResponse.statusCode());
            }
          }
        } else {
          if (result.cause() instanceof ConnectException) {
            routingContext.fail(new ServiceUnavailableException(result.cause().getMessage()));
          } else {
            routingContext.fail(result.cause());
          }
        }
      });
  }
}
