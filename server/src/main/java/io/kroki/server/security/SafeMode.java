package io.kroki.server.security;

public enum SafeMode {
  /** Do not apply any security checking. */
  UNSAFE,
  /** Let each service apply its own internal security checks. */
  SAFE,
  /** Do not trust service internal security checks. */
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
