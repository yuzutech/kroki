package io.kroki.server.error;

public class ErrorInfo {

  private final Throwable failure;
  private final int code;
  private final String message;
  private final String htmlMessage;

  public ErrorInfo(Throwable failure, int code, String message, String htmlMessage) {
    this.failure = failure;
    this.code = code;
    this.message = message;
    this.htmlMessage = htmlMessage;
  }

  public Throwable getFailure() {
    return failure;
  }

  public int getCode() {
    return code;
  }

  public String getMessage() {
    return message;
  }

  public String getHtmlMessage() {
    if (htmlMessage == null) {
      return message;
    }
    return htmlMessage;
  }
}
