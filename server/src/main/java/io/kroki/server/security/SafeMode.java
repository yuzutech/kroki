package io.kroki.server.security;

public enum SafeMode {
  /** Do not apply any security checking. */
  UNSAFE(0),
  /** Let each service apply its own internal security checks. */
  SAFE(1),
  /** Do not trust service internal security checks. */
  SECURE(10);

  public final int value;

  SafeMode(int value) {
    this.value = value;
  }

  public static SafeMode get(String value, SafeMode def) {
    for (SafeMode safeMode : values()) {
      if (safeMode.name().equalsIgnoreCase(value)) {
        return safeMode;
      }
    }
    return def;
  }
}
