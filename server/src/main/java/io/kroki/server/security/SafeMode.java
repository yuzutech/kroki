package io.kroki.server.security;

public enum SafeMode {
  UNSAFE,
  SECURE;

  public static SafeMode get(String value, SafeMode def) {
    for (SafeMode safeMode : values()) {
      if (safeMode.name().equalsIgnoreCase(value)) {
        return safeMode;
      }
    }
    return def;
  }
}
