package io.kroki.server.error;

public class BadRequestException extends RuntimeException {

  public BadRequestException(String message) {
    super(message);
  }

  public BadRequestException(String message, Throwable cause) {
    super(message, cause);
  }

  public String getMessageHTML() {
    return getMessage();
  }
}
