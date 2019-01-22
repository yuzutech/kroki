package io.kroki.server.error;

public class DecodeException extends Exception {

  public DecodeException(String message, Throwable cause) {
    super(message, cause);
  }

  public DecodeException(String message) {
    super(message);
  }
}
