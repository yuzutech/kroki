package io.kroki.server.service;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.impl.Utils;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class HelloHandler {

  private final String rowTemplate;
  private final String tableTemplate;
  private final String pageTemplate;

  public HelloHandler() {
    Properties applicationProperties = new Properties();
    try(InputStream inputStream = HelloHandler.class.getResourceAsStream("/application.properties")){
      applicationProperties.load(inputStream);
    } catch (IOException e) {
      throw new RuntimeException("Unable to load application.properties", e);
    }
    this.rowTemplate = Utils.readResourceToBuffer("web/version_row.html").toString();
    this.tableTemplate = Utils.readResourceToBuffer("web/version_table.html").toString();
    String stylesheet = Utils.readResourceToBuffer("web/root/css/main.css").toString();
    String logo = Utils.readResourceToBuffer("web/root/assets/logo.svg").toString();
    this.pageTemplate = Utils.readResourceToBuffer("web/hello.html").toString()
      .replace("{appSHA1}", applicationProperties.getProperty("app.sha1", ""))
      .replace("{appVersion}", applicationProperties.getProperty("app.version", ""))
      .replace("{stylesheet}", stylesheet)
      .replace("{logo}", logo);
  }

  public Handler<RoutingContext> create() {
    return routingContext -> {
      List<ServiceVersion> serviceVersions = new ArrayList<>();
      // QUESTION: should we dynamically fetch the versions ?
      serviceVersions.add(new ServiceVersion("actdiag", "2.0.0"));
      serviceVersions.add(new ServiceVersion("blockdiag", "2.0.1"));
      serviceVersions.add(new ServiceVersion("bpmn", "6.5.1"));
      serviceVersions.add(new ServiceVersion("bytefield", "1.4.1"));
      serviceVersions.add(new ServiceVersion("c4plantuml", "1.2020.8"));
      serviceVersions.add(new ServiceVersion("ditaa", "1.3.13"));
      serviceVersions.add(new ServiceVersion("erd", "0.1.3.0"));
      serviceVersions.add(new ServiceVersion("graphviz", "2.40.1"));
      serviceVersions.add(new ServiceVersion("mermaid", "8.5.0"));
      serviceVersions.add(new ServiceVersion("nomnoml", "0.7.1"));
      serviceVersions.add(new ServiceVersion("nwdiag", "2.0.0"));
      serviceVersions.add(new ServiceVersion("packetdiag", "2.0.0"));
      serviceVersions.add(new ServiceVersion("plantuml", "1.2020.8"));
      serviceVersions.add(new ServiceVersion("rackdiag", "2.0.0"));
      serviceVersions.add(new ServiceVersion("seqdiag", "2.0.0"));
      serviceVersions.add(new ServiceVersion("svgbob", "0.4.2"));
      serviceVersions.add(new ServiceVersion("umlet", "14.3.0"));
      serviceVersions.add(new ServiceVersion("vega", "5.11.1"));
      serviceVersions.add(new ServiceVersion("vegalite", "4.11.0"));
      serviceVersions.add(new ServiceVersion("wavedrom", "2.3.2"));
      String versionsTable = generateVersionsTable(serviceVersions);
      routingContext
        .response()
        .end(pageTemplate.replace("{versionsTable}", versionsTable));
    };
  }


  private String generateVersionsTable(List<ServiceVersion> serviceVersions) {
    StringBuilder sb = new StringBuilder();
    for (ServiceVersion status : serviceVersions) {
      sb.append(status.toHTML(rowTemplate)).append("\n");
    }
    return tableTemplate
      .replace("{tableBody}", sb.toString());
  }
}
