package io.kroki.server.log;

import io.kroki.server.format.FileFormat;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.HttpResponse;
import org.slf4j.Logger;
import org.slf4j.MDC;

public class Logging {

  private final Logger logger;

  public Logging(Logger logger) {
    this.logger = logger;
  }

  public void requestReceived(RoutingContext routingContext) {
    HttpServerRequest request = routingContext.request();
    try {
      MDC.put("action", "request_received");
      MDC.put("method", request.method().toString());
      MDC.put("path", request.path());
      MDC.put("bytes_read", String.valueOf(request.bytesRead()));
      logger.info("Request received {} {}", request.method(), request.path());
    } finally {
      MDC.remove("action");
      MDC.remove("method");
      MDC.remove("path");
      MDC.remove("bytes_read");
      routingContext.next();
    }
  }

  public void convert(RoutingContext routingContext, long start, String serviceName, FileFormat fileFormat) {
    HttpServerRequest request = routingContext.request();
    try {
      String took = String.valueOf(System.currentTimeMillis() - start);
      MDC.put("action", "convert");
      MDC.put("method", request.method().toString());
      MDC.put("path", request.path());
      MDC.put("service_name", serviceName);
      MDC.put("file_format", fileFormat.getName());
      MDC.put("took", took);
      logger.info("Convert took {}ms", took);
    } finally {
      MDC.remove("action");
      MDC.remove("method");
      MDC.remove("path");
      MDC.remove("service_name");
      MDC.remove("file_format");
      MDC.remove("took");
    }
  }

  public void error(RoutingContext routingContext, int errorCode, String errorMessage) {
    HttpServerRequest request = routingContext.request();
    Throwable failure = routingContext.failure();
    try {
      MDC.put("action", "error");
      MDC.put("method", request.method().toString());
      MDC.put("path", request.path());
      MDC.put("error_code", String.valueOf(errorCode));
      MDC.put("error_message", errorMessage);
      if (failure != null) {
        MDC.put("failure_class_name", failure.getClass().getName());
        logger.error("An error occurred", failure);
      } else {
        logger.error("An error occurred");
      }
    } finally {
      MDC.remove("action");
      MDC.remove("method");
      MDC.remove("path");
      MDC.remove("error_code");
      MDC.remove("error_message");
      MDC.remove("failure_class_name");
    }
  }

  public void delegate(HttpResponse<Buffer> httpResponse, String host, int port, String requestURI) {
    try {
      String path = host + ":" + port + requestURI;
      int statusCode = httpResponse.statusCode();
      String responseBody = httpResponse.bodyAsString();
      MDC.put("action", "delegate");
      MDC.put("method", "POST");
      MDC.put("path", path);
      MDC.put("error_code", String.valueOf(statusCode));
      MDC.put("error_message", responseBody);
      logger.error("Unsuccessful request POST {} - response: {statusCode:{} body: {}}", path, statusCode, responseBody);
    } finally {
      MDC.remove("action");
      MDC.remove("method");
      MDC.remove("path");
      MDC.remove("error_code");
      MDC.remove("error_message");
    }
  }
}
