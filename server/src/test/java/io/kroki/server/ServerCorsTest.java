package io.kroki.server;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.junit5.VertxExtension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static io.kroki.server.ServerListenTest.available;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

@ExtendWith(VertxExtension.class)
public class ServerCorsTest {

  private static final Logger logger = LoggerFactory.getLogger(ServerCorsTest.class);

  @Test
  void with_default_cors_headers(Vertx vertx) throws TimeoutException {
    if (available(8000)) {
      vertx.deployVerticle(new Server(), new DeploymentOptions()).await(5, TimeUnit.SECONDS);
      WebClient client = WebClient.create(vertx);
      // successful request
      HttpResponse<Buffer> response = client
        .request(HttpMethod.OPTIONS, 8000, "localhost", "/")
        .putHeader("origin", "null")
        .putHeader("access-control-request-headers", "OPTIONS")
        .putHeader("access-control-request-method", "")
        .send()
        .await(5, TimeUnit.SECONDS);

      assertThat(response.statusCode()).isEqualTo(204);
      assertThat(response.headers()).extracting("key", "value").contains(tuple(
          "access-control-allow-headers",
          "Access-Control-Allow-Origin,Origin,Content-Type,Accept"
        )
      );
    } else {
      logger.warn("Port 8000 is not available, skipping test");
    }
  }

  @Test
  void with_custom_cors_headers(Vertx vertx) throws TimeoutException {
    if (available(8000)) {
      JsonObject config = new JsonObject()
        .put("KROKI_CORS_ALLOWED_HEADERS", "x-kroki-client-version, x-YUZUTECH-location  ,If-Modified-Since,, x-KROKI-y  ,x-YUZUTECH-location,,");
      vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
      WebClient client = WebClient.create(vertx);
      // successful request
      HttpResponse<Buffer> response = client
        .request(HttpMethod.OPTIONS, 8000, "localhost", "/")
        .putHeader("origin", "null")
        .putHeader("access-control-request-headers", "OPTIONS")
        .putHeader("access-control-request-method", "")
        .send()
        .await(5, TimeUnit.SECONDS);
      assertThat(response.statusCode()).isEqualTo(204);
      assertThat(response.headers()).extracting("key", "value")
        .contains(tuple(
            "access-control-allow-headers",
            "Access-Control-Allow-Origin,Origin,Content-Type,Accept,x-kroki-client-version,x-YUZUTECH-location,If-Modified-Since,x-KROKI-y"
          )
        );
    } else {
      logger.warn("Port 8000 is not available, skipping test");
    }
  }
}
