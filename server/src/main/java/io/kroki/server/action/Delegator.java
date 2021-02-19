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
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.handler.impl.HttpStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.ConnectException;

public class Delegator {

  private static final Logger logger = LoggerFactory.getLogger(Delegator.class);
  private static final Logging logging = new Logging(logger);

  public static void delegate(WebClient client, String host, int port, String requestURI, String body, Handler<AsyncResult<HttpResponse<Buffer>>> handler) {
    client
      .post(port, host, requestURI)
      .putHeader(HttpHeaders.ACCEPT.toString(), HttpHeaderValues.APPLICATION_JSON.toString())
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
          if (HttpHeaderValues.APPLICATION_JSON.contentEquals(contentType)) {
            try {
              JsonObject json = httpResponse.bodyAsJsonObject();
              if (json != null) {
                handler.handle(new Failure(new BadRequestException(json.getString("error", "Unexpected error"))));
              } else {
                handler.handle(new Failure(new HttpStatusException(httpResponse.statusCode())));
              }
            } catch (DecodeException e) {
              handler.handle(new Failure(new HttpStatusException(httpResponse.statusCode())));
            }
          } else {
            handler.handle(new Failure(new HttpStatusException(httpResponse.statusCode())));
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
