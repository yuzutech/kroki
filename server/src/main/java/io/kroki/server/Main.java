package io.kroki.server;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;
import io.vertx.config.ConfigRetriever;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.tracing.opentelemetry.OpenTelemetryTracingFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

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
    VertxOptions vertxOptions = new VertxOptions();
    OpenTelemetry openTelemetry = AutoConfiguredOpenTelemetrySdk.initialize().getOpenTelemetrySdk();
    Vertx vertx = Vertx.builder()
      .with(vertxOptions)
      .withTracer(new OpenTelemetryTracingFactory(openTelemetry))
      .build();
    ConfigRetriever retriever = ConfigRetriever.create(vertx);
    JsonObject config = retriever.getConfig().await();
    Server.start(vertx, vertxOptions, config).onComplete(server -> {
      if (server.failed()) {
        logger.error("Failed to start Kroki server", server.cause());
      } else {
        logger.info("Kroki server started successfully on port {}", server.result().actualPort());
      }
    });
  }
}
