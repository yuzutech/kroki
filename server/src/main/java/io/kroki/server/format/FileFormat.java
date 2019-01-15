package io.kroki.server.format;

import java.util.Iterator;
import java.util.List;

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
    StringBuilder sb = new StringBuilder();
    Iterator<FileFormat> iterator = formats.iterator();
    if (iterator.hasNext()) {
      sb.append(iterator.next().getName());
      while (iterator.hasNext()) {
        FileFormat value = iterator.next();
        String name = value.getName();
        if (iterator.hasNext()) {
          sb.append(", ").append(value);
        } else {
          sb.append(" or ").append(name);
        }
      }
    }
    return sb.toString();
  }

  public String getName() {
    return this.name().toLowerCase();
  }
}
