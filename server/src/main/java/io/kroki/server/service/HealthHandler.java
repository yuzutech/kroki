package io.kroki.server.service;

import io.kroki.server.Main;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.Json;
import io.vertx.ext.web.RoutingContext;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

public class HealthHandler {

  private final String krokiVersionNumber;
  private final String krokiBuildHash;
  private final Supplier<Map<String, String>> versionsSupplier;

  public HealthHandler(Map<String, String> versions) {
    this(() -> versions, null);
  }

  public HealthHandler(Supplier<Map<String, String>> versionsSupplier) {
    this(versionsSupplier, null);
  }

  public HealthHandler(Map<String, String> versions, KrokiBlockedThreadChecker blockedThreadChecker) {
    this(() -> versions, blockedThreadChecker);
  }

  /**
   * @param versionsSupplier queried on every call (rather than a fixed snapshot) so that diagram
   *                          types registered or evicted at runtime (see issue #1423) are reflected
   *                          immediately, both in the /health response and on the homepage.
   */
  public HealthHandler(Supplier<Map<String, String>> versionsSupplier, KrokiBlockedThreadChecker blockedThreadChecker) {
    krokiVersionNumber = Main.getApplicationProperty("app.version", "");
    krokiBuildHash = Main.getApplicationProperty("app.sha1", "");
    this.versionsSupplier = versionsSupplier;
  }

  public Handler<RoutingContext> create() {
    return routingContext -> {
      Map<String, Object> data = new HashMap<>();
      data.put("status", "pass");
      HashMap<String, Object> versions = new HashMap<>();
      HashMap<String, Object> krokiVersion = new HashMap<>();
      krokiVersion.put("number", krokiVersionNumber);
      krokiVersion.put("build_hash", krokiBuildHash);
      versions.put("kroki", krokiVersion);
      data.put("version", versions);
      for (ServiceVersion serviceVersion : getServiceVersions()) {
        versions.put(serviceVersion.getService(), serviceVersion.getVersion());
      }
      routingContext
        .response()
        .putHeader(HttpHeaders.CONTENT_TYPE, "application/health+json")
        .end(Json.encode(data));
    };
  }

  public String getKrokiVersionNumber() {
    return krokiVersionNumber;
  }

  public String getKrokiBuildHash() {
    return krokiBuildHash;
  }

  public List<ServiceVersion> getServiceVersions() {
    List<ServiceVersion> serviceVersions = new ArrayList<>();
    for (Map.Entry<String, String> entry : versionsSupplier.get().entrySet()) {
      serviceVersions.add(new ServiceVersion(entry.getKey(), entry.getValue()));
    }
    return serviceVersions;
  }
}
