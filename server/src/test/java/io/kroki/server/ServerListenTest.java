package io.kroki.server;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.codec.BodyCodec;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.DatagramSocket;
import java.net.ServerSocket;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(VertxExtension.class)
class ServerListenTest {

  private static final Logger logger = LoggerFactory.getLogger(ServerListenTest.class);

  @Test
  void http_server_start_default_check_response(Vertx vertx, VertxTestContext testContext) {
    if (available(8000)) {
      vertx.deployVerticle(new Server(), new DeploymentOptions(), testContext.succeeding(id -> checkServerListening(8000, testContext, vertx)));
    } else {
      logger.warn("Port 8000 is not available, skipping test");
    }
  }

  @Test
  void http_server_start_default_container_check_response(Vertx vertx, VertxTestContext testContext) {
    if (available(8000)) {
      DeploymentOptions options = new DeploymentOptions().setConfig(new JsonObject().put("KROKI_CONTAINER_SUPPORT", ""));
      vertx.deployVerticle(new Server(), options, testContext.succeeding(id -> checkServerListening(8000, testContext, vertx)));
    } else {
      logger.warn("Port 8000 is not available, skipping test");
    }
  }

  @Test
  void http_server_start_k8s_container_check_response(Vertx vertx, VertxTestContext testContext) {
    if (available(8000)) {
      DeploymentOptions options = new DeploymentOptions()
        .setConfig(new JsonObject()
          .put("KROKI_CONTAINER_SUPPORT", "")
          .put("KROKI_PORT", "tcp://1.2.3.4:8000")
        );
      vertx.deployVerticle(new Server(), options, testContext.succeeding(id -> checkServerListening(8000, testContext, vertx)));
    } else {
      logger.warn("Port 8000 is not available, skipping test");
    }
  }

  @Test
  void http_server_start_listen_local_ip_check_response(Vertx vertx, VertxTestContext testContext) throws IOException {
    int port = getAvailablePort();
    DeploymentOptions options = new DeploymentOptions().setConfig(new JsonObject().put("KROKI_LISTEN", "127.0.0.1:" + port));
    vertx.deployVerticle(new Server(), options, testContext.succeeding(id -> checkServerListening(port, testContext, vertx)));
  }

  @Test
  void http_server_start_listen_any_check_response(Vertx vertx, VertxTestContext testContext) throws IOException {
    int port = getAvailablePort();
    DeploymentOptions options = new DeploymentOptions().setConfig(new JsonObject().put("KROKI_LISTEN", "[::]:" + port));
    vertx.deployVerticle(new Server(), options, testContext.succeeding(id -> checkServerListening(port, testContext, vertx)));
  }

  @Test
  void http_server_start_listen_port_check_response(Vertx vertx, VertxTestContext testContext) throws IOException {
    int port = getAvailablePort();
    DeploymentOptions options = new DeploymentOptions().setConfig(new JsonObject().put("KROKI_LISTEN", ":" + port));
    vertx.deployVerticle(new Server(), options, testContext.succeeding(id -> checkServerListening(port, testContext, vertx)));
  }

  @Test
  void http_server_check_response(Vertx vertx, VertxTestContext testContext) throws IOException {
    int port = getAvailablePort();
    DeploymentOptions options = new DeploymentOptions().setConfig(new JsonObject().put("KROKI_PORT", port));
    vertx.deployVerticle(new Server(), options, testContext.succeeding(id -> checkServerListening(port, testContext, vertx)));
  }

  private void checkServerListening(int port, VertxTestContext testContext, Vertx vertx) {
    WebClient client = WebClient.create(vertx);
    client.get(port, "localhost", "/")
      .as(BodyCodec.string())
      .send(testContext.succeeding(response -> testContext.verify(() -> {
        assertThat(response.body()).contains("https://kroki.io");
        testContext.completeNow();
      })));
  }

  private int getAvailablePort() throws IOException {
    ServerSocket socket = new ServerSocket(0);
    int port = socket.getLocalPort();
    socket.close();
    return port;
  }

  public static boolean available(int port) {
    ServerSocket ss = null;
    DatagramSocket ds = null;
    try {
      ss = new ServerSocket(port);
      ss.setReuseAddress(true);
      ds = new DatagramSocket(port);
      ds.setReuseAddress(true);
      return true;
    } catch (IOException ignored) {
    } finally {
      if (ds != null) {
        ds.close();
      }
      if (ss != null) {
        try {
          ss.close();
        } catch (IOException e) {
          /* should not be thrown */
        }
      }
    }
    return false;
  }
}
