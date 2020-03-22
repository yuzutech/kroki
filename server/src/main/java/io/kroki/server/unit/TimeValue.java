package io.kroki.server.unit;

import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

/**
 * Copied and adapted from https://github.com/elastic/elasticsearch/blob/master/libs/core/src/main/java/org/elasticsearch/common/unit/TimeValue.java
 */
public class TimeValue implements Comparable<TimeValue> {

  public static final TimeValue MINUS_ONE = timeValueMillis(-1);
  public static final TimeValue ZERO = timeValueMillis(0);

  private static final long C0 = 1L;
  private static final long C1 = C0 * 1000L;
  private static final long C2 = C1 * 1000L;
  private static final long C3 = C2 * 1000L;
  private static final long C4 = C3 * 60L;
  private static final long C5 = C4 * 60L;
  private static final long C6 = C5 * 24L;

  private final long duration;
  private final TimeUnit timeUnit;

  public TimeValue(long duration, TimeUnit timeUnit) {
    this.duration = duration;
    this.timeUnit = timeUnit;
  }

  public static TimeValue timeValueMillis(long millis) {
    return new TimeValue(millis, TimeUnit.MILLISECONDS);
  }

  public static TimeValue parseTimeValue(String sValue, String settingName) {
    settingName = Objects.requireNonNull(settingName);
    final String normalized = sValue.toLowerCase(Locale.ROOT).trim();
    if (normalized.endsWith("nanos")) {
      return new TimeValue(parse(sValue, normalized, "nanos"), TimeUnit.NANOSECONDS);
    } else if (normalized.endsWith("micros")) {
      return new TimeValue(parse(sValue, normalized, "micros"), TimeUnit.MICROSECONDS);
    } else if (normalized.endsWith("ms")) {
      return new TimeValue(parse(sValue, normalized, "ms"), TimeUnit.MILLISECONDS);
    } else if (normalized.endsWith("s")) {
      return new TimeValue(parse(sValue, normalized, "s"), TimeUnit.SECONDS);
    } else if (sValue.endsWith("m")) {
      // parsing minutes should be case-sensitive as 'M' means "months", not "minutes"; this is the only special case.
      return new TimeValue(parse(sValue, normalized, "m"), TimeUnit.MINUTES);
    } else if (normalized.endsWith("h")) {
      return new TimeValue(parse(sValue, normalized, "h"), TimeUnit.HOURS);
    } else if (normalized.endsWith("d")) {
      return new TimeValue(parse(sValue, normalized, "d"), TimeUnit.DAYS);
    } else if (normalized.matches("-0*1")) {
      return TimeValue.MINUS_ONE;
    } else if (normalized.matches("0+")) {
      return TimeValue.ZERO;
    } else {
      // Missing units:
      throw new IllegalArgumentException("Failed to parse environment variable '" + settingName + "' with value '" + sValue + "' as a time value: unit is missing or unrecognized");
    }
  }

  private static long parse(final String initialInput, final String normalized, final String suffix) {
    final String s = normalized.substring(0, normalized.length() - suffix.length()).trim();
    try {
      return Long.parseLong(s);
    } catch (final NumberFormatException e) {
      try {
        @SuppressWarnings("unused") final double ignored = Double.parseDouble(s);
        throw new IllegalArgumentException("failed to parse [" + initialInput + "], fractional time values are not supported", e);
      } catch (final NumberFormatException ignored) {
        throw new IllegalArgumentException("failed to parse [" + initialInput + "]", e);
      }
    }
  }

  @Override
  public String toString() {
    return "TimeValue{duration: " + duration + ", timeUnit: " + timeUnit + "}";
  }

  /**
   * @return the unit used for the this time value, see {@link #duration()}
   */
  public TimeUnit timeUnit() {
    return timeUnit;
  }

  /**
   * @return the number of {@link #timeUnit()} units this value contains
   */
  public long duration() {
    return duration;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    return this.compareTo(((TimeValue) o)) == 0;
  }

  @Override
  public int hashCode() {
    return Double.hashCode(((double) duration) * timeUnit.toNanos(1));
  }

  @Override
  public int compareTo(TimeValue timeValue) {
    double thisValue = ((double) duration) * timeUnit.toNanos(1);
    double otherValue = ((double) timeValue.duration) * timeValue.timeUnit.toNanos(1);
    return Double.compare(thisValue, otherValue);
  }
}
