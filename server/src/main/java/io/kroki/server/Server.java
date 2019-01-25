package io.kroki.server;

import io.kroki.server.error.ErrorHandler;
import io.kroki.server.service.Blockdiag;
import io.kroki.server.service.C4Plantuml;
import io.kroki.server.service.DiagramRegistry;
import io.kroki.server.service.DiagramRest;
import io.kroki.server.service.Ditaa;
import io.kroki.server.service.Erd;
import io.kroki.server.service.Graphviz;
import io.kroki.server.service.Nomnoml;
import io.kroki.server.service.Plantuml;
import io.kroki.server.service.Svgbob;
import io.kroki.server.service.Umlet;
import io.vertx.config.ConfigRetriever;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Route;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;

public class Server extends AbstractVerticle {

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

  static void start(Vertx vertx, JsonObject config, Handler<AsyncResult<HttpServer>> listenHandler) {
    HttpServer server = vertx.createHttpServer();
    Router router = Router.router(vertx);
    DiagramRegistry registry = new DiagramRegistry(router);
    registry.register(new Plantuml(), "plantuml");
    registry.register(new C4Plantuml(), "c4plantuml");
    registry.register(new Ditaa(), "ditaa");
    registry.register(new Blockdiag(vertx, config), "blockdiag", "seqdiag", "actdiag", "nwdiag");
    registry.register(new Umlet(vertx), "umlet");
    registry.register(new Graphviz(vertx, config), "graphviz", "dot");
    registry.register(new Erd(vertx, config), "erd");
    registry.register(new Svgbob(vertx, config), "svgbob");
    registry.register(new Nomnoml(vertx, config), "nomnoml");

    router.route("/").handler(BodyHandler.create());
    router.post("/").handler(new DiagramRest(registry).create());
    Route route = router.route("/*"); // default route
    route.handler(routingContext -> routingContext.fail(404));
    route.failureHandler(new ErrorHandler(false));
    server.requestHandler(router).listen(config.getInteger("KROKI_PORT", 8000), listenHandler);
  }
}
