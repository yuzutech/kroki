package io.kroki.server.error;

import io.kroki.server.log.Logging;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.MIMEHeader;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.impl.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class ErrorHandler implements io.vertx.ext.web.handler.ErrorHandler {

  private static final Logger logger = LoggerFactory.getLogger(ErrorHandler.class);
  private final Logging logging;

  /**
   * Flag to enable/disable printing the full stack trace of exceptions.
   */
  private final boolean displayExceptionDetails;

  /**
   * Cached template for rendering the html errors
   */
  private final String errorTemplate;


  public ErrorHandler(Vertx vertx, boolean displayExceptionDetails) {
    this.displayExceptionDetails = displayExceptionDetails;
    String stylesheet = vertx.fileSystem().readFileBlocking("web/root/css/main.css").toString();
    String logo = vertx.fileSystem().readFileBlocking("web/root/assets/logo.svg").toString();
    this.errorTemplate = vertx.fileSystem().readFileBlocking("web/error.html").toString()
      .replace("{stylesheet}", stylesheet)
      .replace("{logo}", logo);
    this.logging = new Logging(logger);
  }

  @Override
  public void handle(RoutingContext context) {
    HttpServerResponse response = context.response();
    Throwable failure = context.failure();
    int errorCode = context.statusCode();
    String errorMessage = response.getStatusMessage();
    String statusMessage = null;
    String htmlErrorMessage = null;
    if (failure instanceof BadRequestException) {
      errorCode = 400;
      errorMessage = failure.getMessage();
      statusMessage = "Bad Request";
      htmlErrorMessage = ((BadRequestException) failure).getMessageHTML();
    } else if (failure instanceof ServiceUnavailableException) {
      errorCode = 503;
      errorMessage = failure.getMessage();
      statusMessage = "Service Unavailable";
      htmlErrorMessage = ((ServiceUnavailableException) failure).getMessageHTML();
    } else if (failure instanceof IllegalStateException) {
      errorCode = 500;
      errorMessage = failure.getMessage();
      if (errorMessage == null) {
        errorMessage = "Internal Server Error";
      }
    } else {
      if (errorCode < 400 || errorCode > 500) {
        errorCode = 500;
      }
      if (displayExceptionDetails) {
        errorMessage = failure.getMessage();
      }
      if (errorMessage == null || errorMessage.trim().isEmpty()) {
        errorMessage = "Internal Server Error";
      }
    }
    if (statusMessage == null) {
      statusMessage = errorMessage;
    }
    // no new lines are allowed in the status message
    response.setStatusMessage(statusMessage.replaceAll("[\\r\\n]", " "));
    logging.error(context, errorCode, errorMessage);
    answerWithError(context, errorCode, errorMessage, htmlErrorMessage);
  }

  private void answerWithError(RoutingContext context, int errorCode, String errorMessage, String htmlErrorMessage) {
    context.response().setStatusCode(errorCode);
    if (!sendErrorResponseMIME(context, errorCode, errorMessage, htmlErrorMessage) && !sendErrorAcceptMIME(context, errorCode, errorMessage, htmlErrorMessage)) {
      // fallback plain/text
      sendError(context, "text/plain", errorCode, errorMessage, htmlErrorMessage);
    }
  }

  private boolean sendErrorResponseMIME(RoutingContext context, int errorCode, String errorMessage, String htmlErrorMessage) {
    // does the response already set the mime type?
    String mime = context.response().headers().get(HttpHeaders.CONTENT_TYPE);
    return mime != null && sendError(context, mime, errorCode, errorMessage, htmlErrorMessage);
  }

  private boolean sendErrorAcceptMIME(RoutingContext context, int errorCode, String errorMessage, String htmlErrorMessage) {
    // respect the client accept order
    List<MIMEHeader> acceptableMimes = context.parsedHeaders().accept();
    for (MIMEHeader accept : acceptableMimes) {
      if (sendError(context, accept.value(), errorCode, errorMessage, htmlErrorMessage)) {
        return true;
      }
    }
    return false;
  }

  private boolean sendError(RoutingContext context, String mime, int errorCode, String errorMessage, String htmlErrorMessage) {
    final String title = "\uD83E\uDD16 bip... bip... something wrong happened!";
    HttpServerResponse response = context.response();
    if (mime.startsWith("text/html")) {
      StringBuilder stack = new StringBuilder();
      if (context.failure() != null && displayExceptionDetails) {
        for (StackTraceElement elem : context.failure().getStackTrace()) {
          stack.append("<li>").append(elem).append("</li>");
        }
      }
      response.putHeader(HttpHeaders.CONTENT_TYPE, "text/html");
      if (htmlErrorMessage == null) {
        htmlErrorMessage = errorMessage;
      }
      response.end(
        errorTemplate
          .replace("{title}", title)
          .replace("{errorCode}", Integer.toString(errorCode))
          .replace("{errorMessage}", htmlErrorMessage)
          .replace("{stackTrace}", stack.toString())
      );
      return true;
    }

    if (mime.startsWith("application/json")) {
      JsonObject jsonError = new JsonObject();
      jsonError.put("error", new JsonObject().put("code", errorCode).put("message", errorMessage));
      if (context.failure() != null && displayExceptionDetails) {
        JsonArray stack = new JsonArray();
        for (StackTraceElement elem : context.failure().getStackTrace()) {
          stack.add(elem.toString());
        }
        jsonError.put("stack", stack);
      }

      response.putHeader(HttpHeaders.CONTENT_TYPE, "application/json");
      response.end(jsonError.encode());
      return true;
    }

    if (mime.startsWith("text/plain")) {
      response.putHeader(HttpHeaders.CONTENT_TYPE, "text/plain");
      StringBuilder sb = new StringBuilder();
      sb.append("Error ");
      sb.append(errorCode);
      sb.append(": ");
      sb.append(errorMessage);
      if (context.failure() != null && displayExceptionDetails) {
        for (StackTraceElement elem : context.failure().getStackTrace()) {
          sb.append("\tat ").append(elem).append("\n");
        }
      }
      response.end(sb.toString());
      return true;
    }

    return false;
  }
}
