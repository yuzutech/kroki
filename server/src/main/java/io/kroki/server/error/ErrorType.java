package io.kroki.server.error;

/**
 * Category of an error, exposed as the {@code type} field of JSON error responses.
 * <p>
 * The set of values is part of the API: clients can rely on them to tell why a request failed.
 */
public enum ErrorType {
  /**
   * The request is invalid (empty body, invalid diagram option...).
   */
  INVALID_REQUEST("invalid-request"),
  /**
   * The encoded diagram source cannot be decoded.
   */
  DECODE("decode"),
  /**
   * The diagram type is not supported.
   */
  UNSUPPORTED_DIAGRAM_TYPE("unsupported-diagram-type"),
  /**
   * The output format is not supported by the diagram type.
   */
  UNSUPPORTED_FORMAT("unsupported-format"),
  /**
   * None of the MIME types of the {@code Accept} header is supported by the diagram type.
   */
  UNSUPPORTED_MIME_TYPE("unsupported-mime-type"),
  /**
   * The output format is neither defined in the path nor in the {@code Accept} header.
   */
  MISSING_FORMAT("missing-format"),
  /**
   * The HTTP method is not allowed on this endpoint.
   */
  METHOD_NOT_ALLOWED("method-not-allowed"),
  /**
   * The resource does not exist.
   */
  NOT_FOUND("not-found"),
  /**
   * The request URI is too long, the diagram should be sent in a POST request.
   */
  URI_TOO_LONG("uri-too-long"),
  /**
   * The diagram library rejected the diagram source.
   */
  DIAGRAM_ERROR("diagram-error"),
  /**
   * A service required to render the diagram (companion container) is unavailable.
   */
  SERVICE_UNAVAILABLE("service-unavailable"),
  /**
   * The conversion took too long.
   */
  TIMEOUT("timeout"),
  /**
   * Unexpected error.
   */
  INTERNAL("internal");

  private final String value;

  ErrorType(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }
}
