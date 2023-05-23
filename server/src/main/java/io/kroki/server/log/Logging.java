package io.kroki.server.log;

import io.kroki.server.error.ErrorInfo;
import io.kroki.server.format.FileFormat;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.HttpResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.slf4j.event.Level;

public class Logging {

  public static final Logger deprecationLogger = LoggerFactory.getLogger("io.kroki.server.deprecation");
  private final Logger logger;

  public Logging(Logger logger) {
    this.logger = logger;
  }

  public void requestReceived(RoutingContext routingContext, String serviceName) {
    HttpServerRequest request = routingContext.request();
    try {
      MDC.put("action", "request_received");
      MDC.put("method", request.method().toString());
      MDC.put("path", request.path());
      MDC.put("service_name", serviceName);
      MDC.put("bytes_read", String.valueOf(request.bytesRead()));
      String userAgent = request.getHeader("User-Agent");
      if (userAgent != null) {
        MDC.put("user_agent", userAgent);
      }
      String referer = request.getHeader("Referer");
      if (referer != null) {
        MDC.put("referrer", referer);
      }
      logger.info("Request received {} {}", request.method(), request.path());
    } finally {
      MDC.remove("action");
      MDC.remove("method");
      MDC.remove("path");
      MDC.remove("service_name");
      MDC.remove("bytes_read");
      MDC.remove("user_agent");
      MDC.remove("referrer");
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
      String userAgent = request.getHeader("User-Agent");
      if (userAgent != null) {
        MDC.put("user_agent", userAgent);
      }
      String referer = request.getHeader("Referer");
      if (referer != null) {
        MDC.put("referrer", referer);
      }
      logger.info("Convert took {}ms", took);
    } finally {
      MDC.remove("action");
      MDC.remove("method");
      MDC.remove("path");
      MDC.remove("service_name");
      MDC.remove("file_format");
      MDC.remove("took");
      MDC.remove("user_agent");
      MDC.remove("referrer");
    }
  }

  public void reroute(String from, String to, String source, FileFormat fileFormat) {
    try {
      MDC.put("action", "reroute");
      MDC.put("service_name_from", from);
      MDC.put("service_name_to", to);
      MDC.put("source", source);
      MDC.put("file_format", fileFormat.getName());
      logger.info("Reroute");
    } finally {
      MDC.remove("action");
      MDC.remove("service_name_from");
      MDC.remove("service_name_to");
      MDC.remove("source");
      MDC.remove("file_format");
    }
  }

  public void log(Level level, HttpServerRequest request, ErrorInfo errorInfo) {
    boolean error = level.toInt() >= Level.ERROR.toInt();
    try {
      MDC.put("action", error ? "error" : "warning");
      MDC.put("method", request.method().toString());
      MDC.put("path", request.path());
      MDC.put("error_code", String.valueOf(errorInfo.getCode()));
      MDC.put("error_message", errorInfo.getMessage());
      String userAgent = request.getHeader("User-Agent");
      if (userAgent != null) {
        MDC.put("user_agent", userAgent);
      }
      String referer = request.getHeader("Referer");
      if (referer != null) {
        MDC.put("referrer", referer);
      }
      Throwable failure = errorInfo.getFailure();
      if (failure != null) {
        MDC.put("failure_class_name", failure.getClass().getName());
        if (error) {
          logger.error("Server error", failure);
        } else {
          logger.warn("Bad request");
        }
      } else {
        if (error) {
          logger.error("Server error");
        } else {
          logger.warn("Bad request");
        }
      }
    } finally {
      MDC.remove("action");
      MDC.remove("method");
      MDC.remove("path");
      MDC.remove("error_code");
      MDC.remove("error_message");
      MDC.remove("failure_class_name");
      MDC.remove("user_agent");
      MDC.remove("referrer");
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
