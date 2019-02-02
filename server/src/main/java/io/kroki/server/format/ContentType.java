package io.kroki.server.format;


import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class ContentType {

  private static final Map<FileFormat, String> CONTENT_TYPE;

  static {
    Map<FileFormat, String> map = new HashMap<>();
    map.put(FileFormat.PNG, "image/png");
    map.put(FileFormat.JPEG, "image/jpeg");
    map.put(FileFormat.SVG, "image/svg+xml");
    map.put(FileFormat.PDF, "application/pdf");
    map.put(FileFormat.BASE64, "text/plain; charset=x-user-defined");
    CONTENT_TYPE = Collections.unmodifiableMap(map);
  }

  public static String get(FileFormat fileFormat) {
    return CONTENT_TYPE.get(fileFormat);
  }

  public static FileFormat get(String mimeType) {
    Set<Map.Entry<FileFormat, String>> entries = CONTENT_TYPE.entrySet();
    for (Map.Entry<FileFormat, String> entry : entries) {
      if (entry.getValue().equals(mimeType)) {
        return entry.getKey();
      }
    }
    return null;
  }
}
