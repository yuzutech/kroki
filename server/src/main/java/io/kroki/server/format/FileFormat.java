package io.kroki.server.format;

import io.kroki.server.error.Message;

import java.util.List;
import java.util.stream.Collectors;

public enum FileFormat {
  PNG, SVG, JPEG, EPS, PDF, BASE64;

  public net.sourceforge.plantuml.FileFormat toPlantumlFileFormat() {
    return net.sourceforge.plantuml.FileFormat.valueOf(this.name());
  }

  public static FileFormat get(String format) {
    if (format == null || format.trim().isEmpty()) {
      return null;
    }
    try {
      return FileFormat.valueOf(format.toUpperCase());
    } catch (IllegalArgumentException e) {
      // format not found
      return null;
    }
  }

  public static String stringify(List<FileFormat> formats) {
    if (formats == null || formats.isEmpty()) {
      return "";
    }
    return Message.oneOf(formats.stream().map(FileFormat::getName).collect(Collectors.toList()));
  }

  public static String htmlify(List<FileFormat> formats) {
    if (formats == null || formats.isEmpty()) {
      return "";
    }
    return Message.oneOf(formats.stream().map(ff -> "<code>" + ff.getName() + "</code>").collect(Collectors.toList()));
  }

  public String getName() {
    return this.name().toLowerCase();
  }
}
