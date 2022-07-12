package io.kroki.server.error;

import io.kroki.server.format.FileFormat;

import java.util.List;

public class UnsupportedFormatException extends BadRequestException {

  private final String messageHTML;

  public UnsupportedFormatException(String outputFormat, String serviceName, List<FileFormat> supportedFormat) {
    super(String.format("Unsupported output format: %s for %s. Must be one of %s.", outputFormat, serviceName, FileFormat.stringify(supportedFormat)));
    this.messageHTML = String.format("Unsupported output format: <code>%s</code> for <i>%s</i>. Must be one of %s.", outputFormat, serviceName, FileFormat.htmlify(supportedFormat));
  }

  @Override
  public String getMessageHTML() {
    return messageHTML;
  }
}
