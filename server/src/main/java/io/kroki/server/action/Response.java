package io.kroki.server.action;

import io.vertx.core.http.HttpServerResponse;

public class Response {

  public static void handleUnsupportedFormat(HttpServerResponse response, String outputFormat, String supportedFormatList) {
    response
      .setStatusCode(400)
      .end(String.format("Unsupported output format: " + outputFormat + ". Must be one of %s.", supportedFormatList));
  }
}
