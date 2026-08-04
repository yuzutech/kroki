package io.kroki.server.registry;

import io.kroki.server.format.FileFormat;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.time.Instant;
import java.util.List;

/**
 * A companion service registered dynamically with the gateway (see issue #1423).
 */
public class CompanionRegistration {

  private final String name;
  private final String version;
  private final List<FileFormat> formats;
  private final String host;
  private final int port;
  private final Instant createdAt;
  private volatile Instant updatedAt;
  private volatile Instant lastActivityAt;

  public CompanionRegistration(String name, String version, List<FileFormat> formats, String host, int port, Instant now) {
    this.name = name;
    this.version = version;
    this.formats = formats;
    this.host = host;
    this.port = port;
    this.createdAt = now;
    this.updatedAt = now;
    this.lastActivityAt = now;
  }

  public void heartbeat(Instant now) {
    this.updatedAt = now;
    this.lastActivityAt = now;
  }

  public String getName() {
    return name;
  }

  public String getVersion() {
    return version;
  }

  public List<FileFormat> getFormats() {
    return formats;
  }

  public String getHost() {
    return host;
  }

  public int getPort() {
    return port;
  }

  public Instant getLastActivityAt() {
    return lastActivityAt;
  }

  public JsonObject toJson() {
    JsonArray formatNames = new JsonArray();
    formats.forEach(fileFormat -> formatNames.add(fileFormat.getName()));
    return new JsonObject()
      .put("name", name)
      .put("version", version)
      .put("formats", formatNames)
      .put("created_at", createdAt.toString())
      .put("updated_at", updatedAt.toString())
      .put("last_activity_at", lastActivityAt.toString());
  }
}
