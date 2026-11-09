package io.kroki.server.option;

import io.kroki.server.format.FileFormat;
import io.vertx.core.json.JsonObject;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Describes an option accepted by a diagram service.
 * <p>
 * The descriptor only describes the option (to document it); converting the option into command-line arguments
 * stays in the service.
 *
 * @param name         the option name (lowercase), or the prefix for {@link Kind#PREFIX} options
 * @param kind         how the option is used
 * @param description  a short description
 * @param values       the allowed values ({@link Kind#ENUM} only)
 * @param defaultValue the default value, {@code null} when there is no default (the library or the diagram decides)
 * @param formats      the output formats the option applies to, empty means all formats
 */
public record DiagramOption(
  String name,
  Kind kind,
  String description,
  List<String> values,
  String defaultValue,
  Set<FileFormat> formats
) {

  public enum Kind {
    /**
     * Enabled by its presence, whatever its value.
     */
    FLAG,
    /**
     * Free value.
     */
    VALUE,
    /**
     * Value from a closed set.
     */
    ENUM,
    /**
     * Family of options sharing a prefix, for instance {@code node-attribute-shape}.
     */
    PREFIX
  }

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

  public static DiagramOption prefix(String prefix, String description) {
    return new DiagramOption(prefix, Kind.PREFIX, description, List.of(), null, Set.of());
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
      Map<String, String> result = new LinkedHashMap<>();
      for (String optionName : options.fieldNames()) {
        if (optionName.startsWith(name)) {
          String suffix = optionName.substring(name.length());
          String value = options.getString(optionName);
          if (!suffix.isEmpty() && value != null) {
            result.put(suffix, value);
          }
        }
      }
      return Collections.unmodifiableMap(result);
    }
    String value = get(options);
    return value == null ? Map.of() : Map.of(name, value);
  }
}
