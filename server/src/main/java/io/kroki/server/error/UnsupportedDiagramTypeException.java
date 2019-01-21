package io.kroki.server.error;

import java.util.Set;
import java.util.stream.Collectors;

public class UnsupportedDiagramTypeException extends BadRequestException {

  private final String messageHTML;

  public UnsupportedDiagramTypeException(String diagramType, Set<String> supportedDiagrams) {
    super(String.format("Unsupported diagram type: %s. Must be one of %s", diagramType, Message.oneOf(supportedDiagrams)));
    String oneOfHTML = Message.oneOf(supportedDiagrams.stream().map(sd -> "<code>" + sd + "</code>").collect(Collectors.toList()));
    this.messageHTML = String.format("Unsupported diagram type: <code>%s</code>. Must be one of %s.", diagramType, oneOfHTML);
  }

  @Override
  public String getMessageHTML() {
    return messageHTML;
  }
}
