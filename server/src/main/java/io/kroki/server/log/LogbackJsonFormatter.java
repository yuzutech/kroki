package io.kroki.server.log;

import ch.qos.logback.contrib.json.JsonFormatter;
import io.vertx.core.json.Json;

import java.util.Map;

public class LogbackJsonFormatter implements JsonFormatter {

  private boolean prettyPrint;

  public LogbackJsonFormatter() {
    this.prettyPrint = false;
  }

  @Override
  public String toJsonString(Map m) {
    if (isPrettyPrint()) {
      return Json.encodePrettily(m);
    }
    return Json.encode(m);
  }

  public boolean isPrettyPrint() {
    return prettyPrint;
  }

  public void setPrettyPrint(boolean prettyPrint) {
    this.prettyPrint = prettyPrint;
  }
}
