package io.kroki.server.error;

import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.MIMEHeader;
import io.vertx.ext.web.impl.ParsableMIMEValue;

import java.util.List;
import java.util.stream.Collectors;

public class ErrorContext {

  private final List<MIMEHeader> acceptableMimes;
  private final HttpServerRequest request;
  private final HttpServerResponse response;
  private final ErrorInfo errorInfo;
  private final String statusMessage;

  public ErrorContext(HttpServerRequest request, HttpServerResponse response, String statusMessage, ErrorInfo errorInfo) {
    this.acceptableMimes = request.headers().getAll("accept").stream().map(ParsableMIMEValue::new).collect(Collectors.toList());
    this.request = request;
    this.response = response;
    // no new lines are allowed in the status message
    this.statusMessage = statusMessage.replaceAll("[\\r\\n]", " ");
    this.errorInfo = errorInfo;
  }

  public List<MIMEHeader> getAcceptableMimes() {
    return acceptableMimes;
  }

  public HttpServerRequest getRequest() {
    return request;
  }

  public HttpServerResponse getResponse() {
    return response;
  }

  public String getStatusMessage() {
    return statusMessage;
  }

  public ErrorInfo getErrorInfo() {
    return errorInfo;
  }


  public Throwable getFailure() {
    return errorInfo.getFailure();
  }

  public int getErrorCode() {
    return errorInfo.getCode();
  }

  public String getErrorMessage() {
    return errorInfo.getMessage();
  }

  public String getHtmlErrorMessage() {
    return errorInfo.getHtmlMessage();
  }
}
