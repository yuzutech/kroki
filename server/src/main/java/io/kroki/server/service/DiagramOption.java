package io.kroki.server.service;

import java.util.List;

import io.vertx.core.json.JsonObject;

public final class DiagramOption {
    private enum Type { STRING, PREFIX };

    private final String key;
    private final String defaultValue;
    private final List<String> allowedValues;
    private Type type;

    private DiagramOption(String key, String defaultValue, List<String> allowedValues, Type type) {
        this.key = key;
        this.defaultValue = defaultValue;
        this.allowedValues = allowedValues;
        this.type = type;
    }

    public static DiagramOption of(String key) {
        return new DiagramOption(key, null, List.of(), Type.STRING);
    }

    public static DiagramOption of(String key, String defaultValue, List<String> allowedValues) {
        return new DiagramOption(key, defaultValue, allowedValues, Type.STRING);
    }

    public static DiagramOption prefix(String key) {
        return new DiagramOption(key, null, List.of(), Type.PREFIX);
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
