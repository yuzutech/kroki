package io.kroki.server.action;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.ServiceUnavailableException;
import io.kroki.server.log.Logging;
import io.netty.handler.codec.http.HttpHeaderValues;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpClient;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.DecodeException;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpRequest;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.handler.HttpException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.ConnectException;

public class Delegator {

  private static final Logger logger = LoggerFactory.getLogger(Delegator.class);
  private static final Logging logging = new Logging(logger);
  private final WebClient webClient;

  public Delegator(Vertx vertx) {
    HttpClient httpClient = vertx.httpClientBuilder()
      // https://vertx.io/docs/vertx-web-client/java/#_handling_30x_redirections
      // > By default the client follows redirections
      // But..
      // > For security reason, client won’t follow redirects for request with methods different from GET or HEAD
      // So we need custom redirect handler.
      .withRedirectHandler(new AllowAnyMethodRedirectHandler())
      .build();
    this.webClient = WebClient.wrap(httpClient);
  }

  public Future<HttpResponse<Buffer>> delegate(String host, int port, String requestURI, String body, JsonObject options) {
    HttpRequest<Buffer> request = this.webClient
      .post(port, host, requestURI)
      .putHeader(HttpHeaders.ACCEPT.toString(), HttpHeaderValues.APPLICATION_JSON.toString());
    options.stream().iterator().forEachRemaining(entry -> {
      String key = entry.getKey();
      String value = entry.getValue() != null ? entry.getValue().toString() : "";
      request.addQueryParam(key, value);
    });
    return request
      .sendBuffer(Buffer.buffer(body));
  }

  public static Future<Buffer> handle(String host, int port, String requestURI, Future<HttpResponse<Buffer>> httpResponseFuture) {
    return httpResponseFuture.compose(httpResponse -> {
      if (httpResponse.statusCode() == 200) {
        return Future.succeededFuture(httpResponse.body());
      } else {
        logging.delegate(httpResponse, host, port, requestURI);
        String contentType = httpResponse.getHeader(HttpHeaders.CONTENT_TYPE.toString());
        if (contentType != null && contentType.toLowerCase().startsWith(HttpHeaderValues.APPLICATION_JSON.toString())) {
          try {
            JsonObject json = httpResponse.bodyAsJsonObject();
            if (json != null) {
              final String errorMessage;
              Object error = json.getValue("error");
              if (error instanceof String) {
                errorMessage = (String) error;
              } else if (error instanceof JsonObject) {
                String errorName = ((JsonObject) error).getString("name", "Error");
                String message = ((JsonObject) error).getString("message", "Unexpected error");
                String stackTrace = ((JsonObject) error).getString("stacktrace", "");
                errorMessage = errorName + ": " + message + "\n" + stackTrace;
              } else {
                errorMessage = "Unexpected error";
              }
              return Future.failedFuture(new BadRequestException(errorMessage, httpResponse.statusCode()));
            } else {
              return Future.failedFuture(new HttpException(httpResponse.statusCode()));
            }
          } catch (DecodeException e) {
            return Future.failedFuture(new HttpException(httpResponse.statusCode()));
          }
        } else {
          return Future.failedFuture(new HttpException(httpResponse.statusCode()));
        }
      }
    }, failure -> {
      if (failure instanceof ConnectException) {
        return Future.failedFuture(new ServiceUnavailableException(failure.getMessage()));
      } else {
        return Future.failedFuture(failure);
      }
    });
  }
}
