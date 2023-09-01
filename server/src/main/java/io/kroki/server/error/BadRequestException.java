package io.kroki.server.error;

public class BadRequestException extends RuntimeException {

  private final int statusCode;

  public BadRequestException(String message) {
    super(message);
    this.statusCode = -1;
  }

  public BadRequestException(String message, int statusCode) {
    super(message);
    this.statusCode = statusCode;
  }

  public BadRequestException(String message, Throwable cause) {
    super(message, cause);
    this.statusCode = -1;
  }

  public String getMessageHTML() {
    return getMessage();
  }

  public int getStatusCode() {
    return statusCode;
  }
}
