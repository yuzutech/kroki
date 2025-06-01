package io.kroki.server;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.codec.BodyCodec;
import io.vertx.junit5.VertxExtension;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(VertxExtension.class)
class ServerTest {

  public static String randomAlphaString(int length) {
    StringBuilder builder = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
      char c = (char) (65 + 25 * Math.random());
      builder.append(c);
    }
    return builder.toString();
  }

  private int port;

  @BeforeEach
  void deploy_verticle(Vertx vertx) throws IOException, TimeoutException {
    ServerSocket socket = new ServerSocket(0);
    port = socket.getLocalPort();
    socket.close();
    DeploymentOptions options = new DeploymentOptions().setConfig(new JsonObject().put("KROKI_PORT", port));
    vertx.deployVerticle(new Server(), options).await(5, TimeUnit.SECONDS);
  }

  @Test
  void http_server_check_response(Vertx vertx) {
    WebClient client = WebClient.create(vertx);
    client.get(port, "localhost", "/")
      .as(BodyCodec.string())
      .send()
      .onComplete(response -> {
        if (response.failed()) {
          throw new RuntimeException("Failed to get response", response.cause());
        } else {
          assertThat(response.result().bodyAsString()).contains("https://kroki.io");
        }
      });
  }

  @Test
  void http_server_check_metrics(Vertx vertx) {
    WebClient client = WebClient.create(vertx);
   client.get(port, "localhost", "/metrics")
      .as(BodyCodec.string())
      .send()
      .onComplete(response -> {
        if (response.failed()) {
          throw new RuntimeException("Failed to get response", response.cause());
        } else {
          String bodyAsString = response.result().bodyAsString();
          assertThat(bodyAsString).contains("# HELP kroki_worker_thread_blocked_percentage");
          assertThat(bodyAsString).contains("# TYPE kroki_worker_thread_blocked_percentage gauge");
          assertThat(bodyAsString).contains("# HELP kroki_event_loop_thread_blocked_percentage The percentage of event loop thread blocked.");
          assertThat(bodyAsString).contains("# TYPE kroki_event_loop_thread_blocked_percentage gauge");
          assertThat(bodyAsString).contains("kroki_worker_thread_blocked_percentage 0 ");
          assertThat(bodyAsString).contains("kroki_event_loop_thread_blocked_percentage 0 ");
        }
      });
  }

  @Test
  void http_server_check_cors_handling_regular_origin(Vertx vertx) throws TimeoutException {
    WebClient client = WebClient.create(vertx);
    HttpResponse<String> response = client.get(port, "localhost", "/")
      .putHeader("Origin", "http://localhost")
      .as(BodyCodec.string())
      .send()
      .await(5, TimeUnit.SECONDS);
    assertThat(response.statusCode()).isEqualTo(200);
  }

  @Test
  void http_server_check_cors_handling_null_origin(Vertx vertx) throws TimeoutException {
    WebClient client = WebClient.create(vertx);
    HttpResponse<String> response = client.get(port, "localhost", "/")
      .putHeader("Origin", "null")
      .as(BodyCodec.string())
      .send()
      .await(5, TimeUnit.SECONDS);
    assertThat(response.statusCode()).isEqualTo(200);
  }

  @Test
  void http_server_long_uri_414(Vertx vertx) throws TimeoutException {
    WebClient client = WebClient.create(vertx);
    HttpResponse<String> response = client.get(port, "localhost", "/" + randomAlphaString(5000))
      .as(BodyCodec.string())
      .send()
      .await(5, TimeUnit.SECONDS);
    assertThat(response.statusCode()).isEqualTo(414);
  }
}
