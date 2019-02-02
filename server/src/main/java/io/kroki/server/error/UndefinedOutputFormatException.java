package io.kroki.server.error;

import io.kroki.server.format.FileFormat;

import java.util.List;

public class UndefinedOutputFormatException extends BadRequestException {

  private final String messageHTML;

  public UndefinedOutputFormatException(String serviceName, List<FileFormat> supportedFormat) {
    super("Output format is undefined. Must be defined as part of the query path or as an Accept header.");
    this.messageHTML = "Output format is undefined. Must be defined as part of the query path or as an <code>Accept</code> header.";
  }

  @Override
  public String getMessageHTML() {
    return messageHTML;
  }
}
