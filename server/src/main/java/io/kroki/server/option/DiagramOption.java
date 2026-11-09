package io.kroki.server.option;

import java.util.*;

import io.kroki.server.format.FileFormat;
import io.vertx.core.json.JsonObject;

public record DiagramOption(
  String name,
  Kind kind,
  String description,
  List<String> values,      // ENUM only
  String defaultValue,      // null = no default, the library or the diagram decides
  Set<FileFormat> formats   // empty = all formats
) {
    public enum Kind { FLAG, VALUE, ENUM, PREFIX };

    public DiagramOption {
      Objects.requireNonNull(name);
      Objects.requireNonNull(kind);
      values = List.copyOf(values);
      formats = Set.copyOf(formats);
    }

    public static DiagramOption flag(String name, String description) {
      return new DiagramOption(name, Kind.FLAG, description, List.of(), null, Set.of());
    }

    public static DiagramOption value(String name, String description) {
      return new DiagramOption(name, Kind.VALUE, description, List.of(), null, Set.of());
    }

    public static DiagramOption oneOf(String name, String description, String... values) {
      return new DiagramOption(name, Kind.ENUM, description, List.of(values), null, Set.of());
    }

    public static DiagramOption prefix(String name, String description) {
      return new DiagramOption(name, Kind.PREFIX, description, List.of(), null, Set.of());
    }

    public DiagramOption withDefault(String defaultValue) {
      return new DiagramOption(name, kind, description, values, defaultValue, formats);
    }

    public DiagramOption onlyFor(FileFormat... formats) {
      return new DiagramOption(name, kind, description, values, defaultValue, Set.of(formats));
    }

    public String get(JsonObject options) {
        return options.getString(name);
    }

    public boolean isEnabled(JsonObject options) {
        return get(options) != null;
    }

    public Map<String, String> getAll(JsonObject options) {
      if (kind == Kind.PREFIX) {
        Map<String, String> values = new LinkedHashMap<>();
        for (String optionName : options.fieldNames()) {
          if (optionName.startsWith(name)) {
            String suffix = optionName.substring(name.length());
            String value = options.getString(optionName);
            if (!suffix.isEmpty() && value != null) {
              values.put(suffix, value);
            }
          }
        }
        return Collections.unmodifiableMap(values);
      }

      String value = get(options);
      return value == null ? Map.of() : Map.of(name, value);
    }
}
