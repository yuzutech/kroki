package io.kroki.server.error;

import io.netty.handler.codec.DecoderResult;
import io.netty.handler.codec.TooLongFrameException;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.http.HttpVersion;

public class InvalidRequestHandler implements Handler<HttpServerRequest> {

  private final ErrorHandler errorHandler;
  private final int maxInitialLineLength;

  public InvalidRequestHandler(ErrorHandler errorHandler, int maxInitialLineLength) {
    this.errorHandler = errorHandler;
    this.maxInitialLineLength = maxInitialLineLength;
  }

  /**
   * Copied and adapted from {@link HttpServerRequest#DEFAULT_INVALID_REQUEST_HANDLER} to print an explicit error message when the URL is too long.
   */
  @Override
  public void handle(HttpServerRequest httpServerRequest) {
    DecoderResult result = httpServerRequest.decoderResult();
    Throwable cause = result.cause();
    HttpResponseStatus status = null;
    if (cause instanceof TooLongFrameException) {
      HttpServerResponse response = httpServerRequest.response();
      String causeMsg = cause.getMessage();
      if (causeMsg.startsWith("An HTTP line is larger than")) {
        HttpResponseStatus responseStatus = HttpResponseStatus.REQUEST_URI_TOO_LONG;
        this.errorHandler.handleError(new ErrorContext(
          httpServerRequest,
          response,
          responseStatus.reasonPhrase(),
          new ErrorInfo(
            cause,
            responseStatus.code(),
            "The request URI's length exceeds " + maxInitialLineLength + ". You can update this value by setting KROKI_MAX_URI_LENGTH environment variable. Please read: https://docs.kroki.io/kroki/setup/configuration/#_max_uri_length for more information.",
            null
          )
        ));
        return;
      } else if (causeMsg.startsWith("HTTP header is larger than")) {
        status = HttpResponseStatus.REQUEST_HEADER_FIELDS_TOO_LARGE;
      }
      response.setStatusMessage(causeMsg.replaceAll("[\\r\\n]", " "));
    }
    if (status == null && HttpMethod.GET == httpServerRequest.method() &&
      HttpVersion.HTTP_1_0 == httpServerRequest.version() && "/bad-request".equals(httpServerRequest.uri())) {
      // Matches Netty's specific HttpRequest for invalid messages
      status = HttpResponseStatus.BAD_REQUEST;
    }
    if (status != null) {
      httpServerRequest.response().setStatusCode(status.code()).end();
    } else {
      httpServerRequest.connection().close();
    }
  }
}
