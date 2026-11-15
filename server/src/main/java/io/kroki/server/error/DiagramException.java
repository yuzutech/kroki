package io.kroki.server.error;

/**
 * The diagram library rejected the diagram source.
 * <p>
 * When the diagram library reports where the error is, {@link #getLine()} (and possibly {@link #getColumn()})
 * returns the location in the diagram source (1-based).
 */
public class DiagramException extends BadRequestException {

  private final String reason;
  private final Integer line;
  private final Integer column;

  public DiagramException(String message) {
    this(message, -1);
  }

  public DiagramException(String message, int statusCode) {
    this(message, message, null, null, statusCode, null);
  }

  public DiagramException(String message, Throwable cause) {
    this(message, message, null, null, -1, cause);
  }

  /**
   * @param message the message, including the location if any (used in text, HTML and image error responses)
   * @param reason  the message without the location (used in JSON error responses, where the location has its own fields)
   * @param line    the line (1-based) where the error is, or {@code null} if unknown
   * @param column  the column (1-based) where the error is, or {@code null} if unknown
   */
  public DiagramException(String message, String reason, Integer line, Integer column, int statusCode, Throwable cause) {
    super(message, statusCode, cause, ErrorType.DIAGRAM_ERROR);
    this.reason = reason;
    this.line = line;
    this.column = column;
  }

  /**
   * Create an exception whose message ends with {@code (line: N)} when the line is known.
   */
  public static DiagramException withLine(String reason, Integer line) {
    String message = line == null ? reason : reason + " (line: " + line + ")";
    return new DiagramException(message, reason, line, null, -1, null);
  }

  public String getReason() {
    return reason;
  }

  public Integer getLine() {
    return line;
  }

  public Integer getColumn() {
    return column;
  }
}
