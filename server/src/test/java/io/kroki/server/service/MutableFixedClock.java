package io.kroki.server.service;

import java.io.Serializable;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

public final class MutableFixedClock extends Clock implements Serializable {

  private Instant instant;
  private ZoneId zone;

  MutableFixedClock(Instant fixedInstant, ZoneId zone) {
    this.instant = fixedInstant;
    this.zone = zone;
  }

  public void setInstant(Instant instant) {
    this.instant = instant;
  }

  public void setZone(ZoneId zone) {
    this.zone = zone;
  }

  @Override
  public ZoneId getZone() {
    return zone;
  }

  @Override
  public Clock withZone(ZoneId zone) {
    if (zone.equals(this.zone)) {
      return this;
    }
    return new MutableFixedClock(instant, zone);
  }

  @Override
  public long millis() {
    return instant.toEpochMilli();
  }

  @Override
  public Instant instant() {
    return instant;
  }

  @Override
  public boolean equals(Object obj) {
    return obj instanceof MutableFixedClock
      && instant.equals(((MutableFixedClock) obj).instant)
      && zone.equals((((MutableFixedClock) obj).zone));
  }

  @Override
  public int hashCode() {
    return instant.hashCode() ^ zone.hashCode();
  }

  @Override
  public String toString() {
    return "MutableFixedClock[" + instant + "," + zone + "]";
  }
}
