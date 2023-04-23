package io.kroki.server.format;

import io.kroki.server.error.Message;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum FileFormat {
  PNG, SVG, JPEG, PDF, BASE64, TXT, UTXT;

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
    return stringify(formats, FileFormat::getName);
  }

  public static String stringify(List<FileFormat> formats, Function<FileFormat, String> toString) {
    if (formats == null || formats.isEmpty()) {
      return "";
    }
    return Message.oneOf(formats.stream().map(toString).collect(Collectors.toList()));
  }

  public static String htmlify(List<FileFormat> formats) {
    return htmlify(formats, FileFormat::getName);
  }

  public static String htmlify(List<FileFormat> formats, Function<FileFormat, String> toString) {
    if (formats == null || formats.isEmpty()) {
      return "";
    }
    return Message.oneOf(formats.stream().map(ff -> "<code>" + toString.apply(ff) + "</code>").collect(Collectors.toList()));
  }

  public String getName() {
    return this.name().toLowerCase();
  }

  public String getMimeType() {
    return ContentType.get(this);
  }
}
