package io.kroki.server;

import io.kroki.server.service.*;
import io.vertx.config.ConfigRetriever;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;

public class KrokiVerticle extends AbstractVerticle {

  @Override
  public void start(Future<Void> startFuture) {
    ConfigRetriever retriever = ConfigRetriever.create(vertx);
    retriever.getConfig(configResult -> {
      if (configResult.failed()) {
        startFuture.fail(configResult.cause());
      } else {
        start(vertx, configResult.result(), startResult -> {
          if (startResult.succeeded()) {
            startFuture.complete();
          } else {
            startFuture.fail(startResult.cause());
          }
        });
      }
    });
  }

  public static void start(Vertx vertx, JsonObject config, Handler<AsyncResult<HttpServer>> listenHandler) {
    HttpServer server = vertx.createHttpServer();
    Router router = Router.router(vertx);
    Blockdiag blockdiag = new Blockdiag(vertx);
    Asciitosvg asciitosvg = new Asciitosvg(vertx);
    Umlet umlet = new Umlet(vertx);
    Graphviz graphviz = new Graphviz(vertx, config);
    Svgbob svgbob = new Svgbob(vertx, config);
    Erd erd = new Erd(vertx, config);
    C4Plantuml c4plantuml = new C4Plantuml();
    router.route("/plantuml/:output_format/:source_encoded").handler(Plantuml.convertRoute());
    router.route("/c4plantuml/:output_format/:source_encoded").handler(c4plantuml.convertRoute());
    router.route("/ditaa/:output_format/:source_encoded").handler(Ditaa.convertRoute());
    router.route("/blockdiag/:output_format/:source_encoded").handler(blockdiag.convertRoute());
    router.route("/seqdiag/:output_format/:source_encoded").handler(blockdiag.convertRoute());
    router.route("/actdiag/:output_format/:source_encoded").handler(blockdiag.convertRoute());
    router.route("/nwdiag/:output_format/:source_encoded").handler(blockdiag.convertRoute());
    router.route("/asciitosvg/:output_format/:source_encoded").handler(asciitosvg.convertRoute());
    router.route("/umlet/:output_format/:source_encoded").handler(umlet.convertRoute());
    router.route("/graphviz/:output_format/:source_encoded").handler(graphviz.convertRoute());
    router.route("/dot/:output_format/:source_encoded").handler(graphviz.convertRoute());
    router.route("/erd/:output_format/:source_encoded").handler(erd.convertRoute());
    router.route("/svgbob/:output_format/:source_encoded").handler(svgbob.convertRoute());
    server.requestHandler(router).listen(config.getInteger("KROKI_PORT", 8000), listenHandler);
  }
}
