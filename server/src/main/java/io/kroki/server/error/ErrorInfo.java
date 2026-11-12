package io.kroki.server.error;

public class ErrorInfo {

  private final Throwable failure;
  private final int code;
  private final String message;
  private final String htmlMessage;
  private final ErrorType type;

  public ErrorInfo(Throwable failure, int code, String message, String htmlMessage) {
    this(failure, code, message, htmlMessage, ErrorType.INTERNAL);
  }

  public ErrorInfo(Throwable failure, int code, String message, String htmlMessage, ErrorType type) {
    this.failure = failure;
    this.code = code;
    this.message = message;
    this.htmlMessage = htmlMessage;
    this.type = type;
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

  public ErrorType getType() {
    return type;
  }
}
