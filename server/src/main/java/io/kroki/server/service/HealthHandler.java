package io.kroki.server.service;

import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.Json;
import io.vertx.ext.web.RoutingContext;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class HealthHandler {

  private final String krokiVersionNumber;
  private final String krokiBuildHash;
  private final List<ServiceVersion> serviceVersions;

  public HealthHandler() {
    Properties applicationProperties = new Properties();
    try (InputStream inputStream = HelloHandler.class.getResourceAsStream("/application.properties")) {
      applicationProperties.load(inputStream);
    } catch (IOException e) {
      throw new RuntimeException("Unable to load application.properties", e);
    }
    krokiVersionNumber = applicationProperties.getProperty("app.version", "");
    krokiBuildHash = applicationProperties.getProperty("app.sha1", "");
    serviceVersions = new ArrayList<>();
    // QUESTION: should we dynamically fetch the versions ?
    serviceVersions.add(new ServiceVersion("actdiag", "2.0.0"));
    serviceVersions.add(new ServiceVersion("blockdiag", "2.0.1"));
    serviceVersions.add(new ServiceVersion("bpmn", "7.3.0"));
    serviceVersions.add(new ServiceVersion("bytefield", "1.5.0"));
    serviceVersions.add(new ServiceVersion("c4plantuml", "1.2020.15"));
    serviceVersions.add(new ServiceVersion("ditaa", "1.3.13"));
    serviceVersions.add(new ServiceVersion("erd", "0.1.3.0"));
    serviceVersions.add(new ServiceVersion("graphviz", "2.40.1"));
    serviceVersions.add(new ServiceVersion("mermaid", "8.7.0"));
    serviceVersions.add(new ServiceVersion("nomnoml", "0.7.2"));
    serviceVersions.add(new ServiceVersion("nwdiag", "2.0.0"));
    serviceVersions.add(new ServiceVersion("packetdiag", "2.0.0"));
    serviceVersions.add(new ServiceVersion("plantuml", "1.2020.15"));
    serviceVersions.add(new ServiceVersion("rackdiag", "2.0.0"));
    serviceVersions.add(new ServiceVersion("seqdiag", "2.0.0"));
    serviceVersions.add(new ServiceVersion("svgbob", "0.4.2"));
    serviceVersions.add(new ServiceVersion("umlet", "14.3.0"));
    serviceVersions.add(new ServiceVersion("vega", "5.13.0"));
    serviceVersions.add(new ServiceVersion("vegalite", "4.14.1"));
    serviceVersions.add(new ServiceVersion("wavedrom", "2.3.2"));
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
      for (ServiceVersion serviceVersion: serviceVersions) {
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
    return serviceVersions;
  }
}
