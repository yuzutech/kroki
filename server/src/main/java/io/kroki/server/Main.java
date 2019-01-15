package io.kroki.server;

import io.kroki.server.service.Asciitosvg;
import io.kroki.server.service.Blockdiag;
import io.kroki.server.service.Ditaa;
import io.kroki.server.service.Graphviz;
import io.kroki.server.service.Plantuml;
import io.kroki.server.service.Umlet;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServer;
import io.vertx.ext.web.Router;

public class Main {

  public static void main(String[] args) {
    Vertx vertx = Vertx.vertx();

    HttpServer server = vertx.createHttpServer();
    Router router = Router.router(vertx);

    Blockdiag blockdiag = new Blockdiag(vertx);
    Asciitosvg asciitosvg = new Asciitosvg(vertx);
    Umlet umlet = new Umlet(vertx);
    Graphviz graphviz = new Graphviz(vertx);
    router.route("/plantuml/:output_format/:source_encoded").handler(Plantuml.convertRoute());
    router.route("/ditaa/:output_format/:source_encoded").handler(Ditaa.convertRoute());
    router.route("/blockdiag/:output_format/:source_encoded").handler(blockdiag.convertRoute());
    router.route("/seqdiag/:output_format/:source_encoded").handler(blockdiag.convertRoute());
    router.route("/actdiag/:output_format/:source_encoded").handler(blockdiag.convertRoute());
    router.route("/nwdiag/:output_format/:source_encoded").handler(blockdiag.convertRoute());
    router.route("/asciitosvg/:output_format/:source_encoded").handler(asciitosvg.convertRoute());
    router.route("/umlet/:output_format/:source_encoded").handler(umlet.convertRoute());
    router.route("/graphviz/:output_format/:source_encoded").handler(graphviz.convertRoute());
    router.route("/dot/:output_format/:source_encoded").handler(graphviz.convertRoute());
    server.requestHandler(router).listen(8000);
  }

}
