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
import io.vertx.core.http.PoolOptions;
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
  // Upstream companion services (mermaid, bpmn, ...) enforce their own convert
  // timeout (10s by default). Allow a bit more so we receive their structured
  // error response rather than cutting first, but never wait unbounded: without
  // a timeout a wedged companion lets requests pile up in the client queue until
  // the core runs out of memory.
  private static final long DEFAULT_TIMEOUT_MS = 30_000;
  // Vert.x's own default (5) is below Mermaid's KROKI_MERMAID_MAX_CONCURRENCY (6,
  // see mermaid/src/worker.js): when the companion is degraded (e.g. Chromium
  // restarting after a crash), every in-flight request holds its pooled connection
  // for up to timeoutMs, so a 6th legitimate request can't even acquire a
  // connection and times out ("...exceeded when getting a connection to
  // <host>:<port>") well before the companion itself is actually overloaded.
  private static final int DEFAULT_MAX_POOL_SIZE = 10;
  private final WebClient webClient;
  private final long timeoutMs;

  public Delegator(Vertx vertx) {
    this(vertx, new JsonObject());
  }

  public Delegator(Vertx vertx, JsonObject config) {
    Integer configuredPoolSize = config.getInteger("KROKI_DELEGATE_MAX_POOL_SIZE");
    int maxPoolSize = configuredPoolSize != null && configuredPoolSize > 0 ? configuredPoolSize : DEFAULT_MAX_POOL_SIZE;
    HttpClient httpClient = vertx.httpClientBuilder()
      // https://vertx.io/docs/vertx-web-client/java/#_handling_30x_redirections
      // > By default the client follows redirections
      // But..
      // > For security reason, client won’t follow redirects for request with methods different from GET or HEAD
      // So we need custom redirect handler.
      .withRedirectHandler(new AllowAnyMethodRedirectHandler())
      .with(new PoolOptions().setHttp1MaxSize(maxPoolSize))
      .build();
    this.webClient = WebClient.wrap(httpClient);
    Long configured = config.getLong("KROKI_DELEGATE_TIMEOUT_MS");
    this.timeoutMs = configured != null && configured > 0 ? configured : DEFAULT_TIMEOUT_MS;
  }

  public Future<HttpResponse<Buffer>> delegate(String host, int port, String requestURI, String body, JsonObject options) {
    HttpRequest<Buffer> request = this.webClient
      .post(port, host, requestURI)
      .timeout(this.timeoutMs)
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
