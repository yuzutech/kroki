package io.kroki.server;

import static org.assertj.core.api.Assertions.assertThat;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.core.net.PemKeyCertOptions;
import io.vertx.core.net.SelfSignedCertificate;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import io.vertx.ext.web.codec.BodyCodec;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import java.io.IOException;
import java.net.ServerSocket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(VertxExtension.class)
class ServerSSLTest {

  private int port;
  private PemKeyCertOptions pemKeyCertOptions;

  @BeforeEach
  void init() throws IOException {
    ServerSocket socket = new ServerSocket(0);
    port = socket.getLocalPort();
    socket.close();
    pemKeyCertOptions = SelfSignedCertificate.create().keyCertOptions();
  }

  @Test
  void http_server_check_response_fail(Vertx vertx, VertxTestContext testContext) {
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(getJsonConfig(vertx)),
      id -> {
        WebClient client = WebClient.create(vertx);
        client.get(port, "localhost", "/").as(BodyCodec.string())
          .send(testContext.failing(response -> testContext.verify(testContext::completeNow)));
      });
  }

  @Test
  void http_server_check_response_success(Vertx vertx, VertxTestContext testContext) {
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(getJsonConfig(vertx)), id->{
    WebClientOptions options = new WebClientOptions();
    options.setSsl(true);
    options.setTrustAll(true);
    WebClient client = WebClient.create(vertx, options);
      client.get(port, "localhost", "/").as(BodyCodec.string())
        .send(testContext.succeeding(response -> testContext.verify(() -> {
          assertThat(response.body()).contains("https://kroki.io");
          testContext.completeNow();
        })));
    });
  }

  @Test
  void http_server_check_response_missing_data(Vertx vertx, VertxTestContext testContext) {
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(getJsonConfigWithKeyOnly(vertx)), id->{
      WebClientOptions options = new WebClientOptions();
      options.setSsl(true);
      options.setTrustAll(true);
      WebClient client = WebClient.create(vertx, options);
      client.get(port, "localhost", "/").as(BodyCodec.string())
        .send(testContext.failing(response -> testContext.verify(testContext::completeNow)));
    });
  }

  private JsonObject getJsonConfig(Vertx vertx) {
    return getJsonConfigWithKeyOnly(vertx)
      .put("KROKI_SSL_CERT", vertx.fileSystem().readFileBlocking(pemKeyCertOptions.getCertPath()).toString());
  }

  private JsonObject getJsonConfigWithKeyOnly(Vertx vertx) {
    return new JsonObject().put("KROKI_PORT", port).put("KROKI_SSL", true)
      .put("KROKI_SSL_KEY", vertx.fileSystem().readFileBlocking(pemKeyCertOptions.getKeyPath()).toString());
  }
}
