package io.kroki.server;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.codec.BodyCodec;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.IOException;
import java.net.ServerSocket;

import static io.kroki.server.ServerTest.randomAlphaString;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(VertxExtension.class)
public class ServerUriResponseTest {

  private int port;

  @BeforeEach
  void deploy_verticle(Vertx vertx, VertxTestContext testContext) throws IOException {
    ServerSocket socket = new ServerSocket(0);
    port = socket.getLocalPort();
    socket.close();
    DeploymentOptions options = new DeploymentOptions().setConfig(new JsonObject().put("KROKI_PORT", port).put("KROKI_MAX_URI_LENGTH", 8192));
    vertx.deployVerticle(new Server(), options, testContext.succeedingThenComplete());
  }

  @Test
  void http_server_long_uri_not_414(Vertx vertx, VertxTestContext testContext) {
    WebClient client = WebClient.create(vertx);
    client.get(port, "localhost", "/" + randomAlphaString(6000))
      .as(BodyCodec.string())
      .send(testContext.succeeding(response -> testContext.verify(() -> {
        assertThat(response.statusCode()).isNotEqualTo(414);
        testContext.completeNow();
      })));
  }

  @Test
  void http_server_long_uri_414(Vertx vertx, VertxTestContext testContext) {
    WebClient client = WebClient.create(vertx);
    client.get(port, "localhost", "/" + randomAlphaString(9000))
      .as(BodyCodec.string())
      .send(testContext.succeeding(response -> testContext.verify(() -> {
        assertThat(response.statusCode()).isEqualTo(414);
        assertThat(response.statusMessage()).isEqualTo("Request-URI Too Long");
        assertThat(response.body()).isEqualTo("Error 414: The request URI's length exceeds 8192. You can update this value by setting KROKI_MAX_URI_LENGTH environment variable. Please read: https://docs.kroki.io/kroki/setup/configuration/#_max_uri_length for more information.");
        testContext.completeNow();
      })));
  }
}
