package io.kroki.server.service;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.impl.Utils;

import java.util.List;

public class HelloHandler {

  private final String rowTemplate;
  private final String tableTemplate;
  private final String pageTemplate;
  private final List<ServiceVersion> serviceVersions;

  public HelloHandler(List<ServiceVersion> serviceVersions, String krokiVersionNumber, String krokiBuildHash) {
    this.serviceVersions = serviceVersions;
    this.rowTemplate = Utils.readResourceToBuffer("web/version_row.html").toString();
    this.tableTemplate = Utils.readResourceToBuffer("web/version_table.html").toString();
    String stylesheet = Utils.readResourceToBuffer("web/root/css/main.css").toString();
    String logo = Utils.readResourceToBuffer("web/root/assets/logo.svg").toString();
    this.pageTemplate = Utils.readResourceToBuffer("web/hello.html").toString()
      .replace("{appSHA1}", krokiBuildHash)
      .replace("{appVersion}", krokiVersionNumber)
      .replace("{stylesheet}", stylesheet)
      .replace("{logo}", logo);
  }

  public Handler<RoutingContext> create() {
    return routingContext -> {
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
