package io.kroki.server;

import io.vertx.config.ConfigRetriever;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Properties;
import java.io.IOException;
import java.io.InputStream;

public class Main {

  private static final Logger logger = LoggerFactory.getLogger(Main.class);
  private static final Properties applicationProperties = new Properties();

  public static String getApplicationProperty(String key, String defaultValue) {
    // Load here instead of in main() to simplify testing. Performance is not an issue.
    if (applicationProperties.isEmpty()) {
      try (InputStream inputStream = Main.class.getResourceAsStream("/application.properties")) {
        applicationProperties.load(inputStream);
      } catch (IOException e) {
        throw new RuntimeException("Unable to load application.properties", e);
      }
    }
    return applicationProperties.getProperty(key, defaultValue);
  }

  public static void main(String[] args) {
    Vertx vertx = Vertx.vertx();
    VertxOptions vertxOptions = new VertxOptions();
    ConfigRetriever retriever = ConfigRetriever.create(vertx);
    retriever.getConfig(configResult -> {
      if (configResult.failed()) {
        logger.error("Unable to start", configResult.cause());
      } else {
        Server.start(vertx, vertxOptions, configResult.result(), startResult -> {
          if (startResult.failed()) {
            logger.error("Unable to start", startResult.cause());
          }
        });
      }
    });
  }
}
