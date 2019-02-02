package io.kroki.server.error;

import io.kroki.server.format.FileFormat;

import java.util.List;
import java.util.stream.Collectors;

public class UnsupportedMimeTypeException extends BadRequestException {

  private final String messageHTML;

  public UnsupportedMimeTypeException(List<String> mimeTypes, String serviceName, List<FileFormat> supportedFormats) {
    super(String.format("Content negotiation failed, no output format found for the following MIME types: %s. Must be one of %s for %s.",
      mimeTypes.stream().collect(Collectors.joining(",")),
      FileFormat.stringify(supportedFormats, FileFormat::getMimeType),
      serviceName));
    this.messageHTML = String.format("Content negotiation failed, no output format found for the following MIME types: %s. Must be one of %s for <i>%s</i>.",
      mimeTypes.stream().map(v -> "<code>" + v + "</code>").collect(Collectors.joining(",")),
      FileFormat.htmlify(supportedFormats, FileFormat::getMimeType),
      serviceName);
  }

  @Override
  public String getMessageHTML() {
    return messageHTML;
  }
}
