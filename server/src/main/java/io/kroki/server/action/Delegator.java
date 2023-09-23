package io.kroki.server.action;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.ServiceUnavailableException;
import io.kroki.server.log.Logging;
import io.netty.handler.codec.http.HttpHeaderValues;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
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

  public static void delegate(WebClient client, String host, int port, String requestURI, String body, JsonObject options, Handler<AsyncResult<HttpResponse<Buffer>>> handler) {
    HttpRequest<Buffer> request = client
      .post(port, host, requestURI)
      .putHeader(HttpHeaders.ACCEPT.toString(), HttpHeaderValues.APPLICATION_JSON.toString());
    options.stream().iterator().forEachRemaining(entry -> {
      String key = entry.getKey();
      String value = entry.getValue() != null ? entry.getValue().toString() : "";
      request.addQueryParam(key, value);
    });
    request
      .sendBuffer(Buffer.buffer(body), handler);
  }

  public static Handler<AsyncResult<HttpResponse<Buffer>>> createHandler(String host, int port, String requestURI, Handler<AsyncResult<Buffer>> handler) {
    return result -> {
      if (result.succeeded()) {
        HttpResponse<Buffer> httpResponse = result.result();
        if (httpResponse.statusCode() == 200) {
          handler.handle(new Success(httpResponse.body()));
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
                handler.handle(new Failure(new BadRequestException(errorMessage, httpResponse.statusCode())));
              } else {
                handler.handle(new Failure(new HttpException(httpResponse.statusCode())));
              }
            } catch (DecodeException e) {
              handler.handle(new Failure(new HttpException(httpResponse.statusCode())));
            }
          } else {
            handler.handle(new Failure(new HttpException(httpResponse.statusCode())));
          }
        }
      } else {
        if (result.cause() instanceof ConnectException) {
          handler.handle(new Failure(new ServiceUnavailableException(result.cause().getMessage())));
        } else {
          handler.handle(new Failure(result.cause()));
        }
      }
    };
  }

  public static class Success implements AsyncResult<Buffer> {

    private final Buffer buffer;

    public Success(Buffer buffer) {
      this.buffer = buffer;
    }

    @Override
    public Buffer result() {
      return buffer;
    }

    @Override
    public Throwable cause() {
      return null;
    }

    @Override
    public boolean succeeded() {
      return true;
    }

    @Override
    public boolean failed() {
      return false;
    }
  }

  public static class Failure implements AsyncResult<Buffer> {

    private final Throwable cause;

    public Failure(Throwable cause) {
      this.cause = cause;
    }

    @Override
    public Buffer result() {
      return null;
    }

    @Override
    public Throwable cause() {
      return cause;
    }

    @Override
    public boolean succeeded() {
      return false;
    }

    @Override
    public boolean failed() {
      return true;
    }
  }
}
