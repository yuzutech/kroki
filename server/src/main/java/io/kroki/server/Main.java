package io.kroki.server;

import io.vertx.config.ConfigRetriever;
import io.vertx.core.Vertx;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {

  private static final Logger logger = LoggerFactory.getLogger(Main.class);

  public static void main(String[] args) {
    Vertx vertx = Vertx.vertx();
    ConfigRetriever retriever = ConfigRetriever.create(vertx);
    retriever.getConfig(configResult -> {
      if (configResult.failed()) {
        logger.error("Unable to start", configResult.cause());
      } else {
        KrokiVerticle.start(vertx, configResult.result(), startResult -> {
          if (startResult.failed()) {
            logger.error("Unable to start", startResult.cause());
          }
        });
      }
    });
  }

}
