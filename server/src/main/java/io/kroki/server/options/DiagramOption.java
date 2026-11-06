package io.kroki.server.options;

import java.util.List;

import io.vertx.core.json.JsonObject;

public final class DiagramOption {
    private final String key;
    private final String defaultValue;
    private final List<String> allowedValues;

    private DiagramOption(String key, String defaultValue, List<String> allowedValues) {
        this.key = key;
        this.defaultValue = defaultValue;
        this.allowedValues = allowedValues;
    }

    public static DiagramOption of(String key) {
        return new DiagramOption(key, null, List.of());
    }

    public static DiagramOption of(String key, String defaultValue, List<String> allowedValues) {
        return new DiagramOption(key, defaultValue, allowedValues);
    }

    public String getKey() {
        return key;
    }

    public String get(JsonObject options) {
        return options.getString(key);
    }

    public boolean hasValue(JsonObject options, String expected) {
        return expected.equals(get(options));
    }

    public boolean isEnabled(JsonObject options) {
        return get(options) != null;
    }
}
