package io.kroki.server.service;

import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpHeaders;
import io.vertx.ext.web.RoutingContext;

import java.util.List;
import java.util.function.Supplier;

public class HelloHandler {

  private final String rowTemplate;
  private final String tableTemplate;
  private final String pageTemplate;
  private final Supplier<List<ServiceVersion>> serviceVersionsSupplier;

  public HelloHandler(Vertx vertx, List<ServiceVersion> serviceVersions, String krokiVersionNumber, String krokiBuildHash) {
    this(vertx, () -> serviceVersions, krokiVersionNumber, krokiBuildHash);
  }

  /**
   * @param serviceVersionsSupplier queried on every request (rather than a fixed snapshot) so
   *                                 that diagram types registered or evicted at runtime (see
   *                                 issue #1423) show up on the homepage immediately.
   */
  public HelloHandler(Vertx vertx, Supplier<List<ServiceVersion>> serviceVersionsSupplier, String krokiVersionNumber, String krokiBuildHash) {
    this.serviceVersionsSupplier = serviceVersionsSupplier;
    this.rowTemplate = vertx.fileSystem().readFileBlocking("web/version_row.html").toString();
    this.tableTemplate = vertx.fileSystem().readFileBlocking("web/version_table.html").toString();
    String stylesheet = vertx.fileSystem().readFileBlocking("web/root/css/main.css").toString();
    String logo = vertx.fileSystem().readFileBlocking("web/root/assets/logo.svg").toString();
    this.pageTemplate = vertx.fileSystem().readFileBlocking("web/hello.html").toString()
      .replace("{appSHA1}", krokiBuildHash)
      .replace("{appVersion}", krokiVersionNumber)
      .replace("{stylesheet}", stylesheet)
      .replace("{logo}", logo);
  }

  public Handler<RoutingContext> create() {
    return routingContext -> {
      String versionsTable = generateVersionsTable(serviceVersionsSupplier.get());
      routingContext
        .response()
        .putHeader(HttpHeaders.CONTENT_TYPE, "text/html")
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
