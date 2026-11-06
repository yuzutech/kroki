package io.kroki.server.options;

import java.util.List;

import io.vertx.core.json.JsonObject;

public final class DiagramOptions {
    private final String name;
    private final String defaultValue;
    private final List<String> allowedValues;

    private DiagramOptions(String name, String defaultValue, List<String> allowedValues) {
        this.name = name;
        this.defaultValue = defaultValue;
        this.allowedValues = allowedValues;
    }

    public static DiagramOptions of(String name) {
        return new DiagramOptions(name, null, List.of());
    }

    public String get(JsonObject options) {
        return options.getString(name);
    }

    public boolean isEnabled(JsonObject options) {
        return get(options) != null;
    }
}
