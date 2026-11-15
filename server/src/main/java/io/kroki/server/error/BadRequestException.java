package io.kroki.server.error;

public class BadRequestException extends RuntimeException {

  private final int statusCode;
  private final ErrorType type;

  public BadRequestException(String message) {
    this(message, -1, null, ErrorType.INVALID_REQUEST);
  }

  public BadRequestException(String message, int statusCode) {
    this(message, statusCode, null, ErrorType.INVALID_REQUEST);
  }

  public BadRequestException(String message, Throwable cause) {
    this(message, -1, cause, ErrorType.INVALID_REQUEST);
  }

  public BadRequestException(String message, ErrorType type) {
    this(message, -1, null, type);
  }

  public BadRequestException(String message, Throwable cause, ErrorType type) {
    this(message, -1, cause, type);
  }

  public BadRequestException(String message, int statusCode, Throwable cause, ErrorType type) {
    super(message, cause);
    this.statusCode = statusCode;
    this.type = type;
  }

  public String getMessageHTML() {
    return getMessage();
  }

  public int getStatusCode() {
    return statusCode;
  }

  public ErrorType getType() {
    return type;
  }
}
