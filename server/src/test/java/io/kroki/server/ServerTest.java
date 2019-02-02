package io.kroki.server;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.codec.BodyCodec;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.IOException;
import java.net.ServerSocket;

import static org.assertj.core.api.Assertions.assertThat;

@Disabled
@ExtendWith(VertxExtension.class)
class ServerTest {

  private int port;

  @BeforeEach
  void deploy_verticle(Vertx vertx, VertxTestContext testContext) throws IOException {
    ServerSocket socket = new ServerSocket(0);
    port = socket.getLocalPort();
    socket.close();
    DeploymentOptions options = new DeploymentOptions().setConfig(new JsonObject().put("KROKI_PORT", port));
    vertx.deployVerticle(new Server(), options, testContext.completing());
  }

  @Test
  void http_server_check_response(Vertx vertx, VertxTestContext testContext) {
    WebClient client = WebClient.create(vertx);
    client.get(port, "localhost", "/")
      .as(BodyCodec.string())
      .send(testContext.succeeding(response -> testContext.verify(() -> {
        assertThat(response.body()).isEqualTo("Plop");
        testContext.completeNow();
      })));
  }
}
