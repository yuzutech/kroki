package io.kroki.server.action;

public class DitaaContext {

  private final String source;
  private final String options;

  public DitaaContext(String source, String options) {
    this.source = source;
    this.options = options;
  }

  public String getSource() {
    return source;
  }

  public String getOptions() {
    return options;
  }
}
