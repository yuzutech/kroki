package io.kroki.server;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.itextpdf.text.pdf.security.VerificationException;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.VertxException;
import io.vertx.core.json.JsonObject;
import io.vertx.core.net.NetClient;
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

  @BeforeEach
  void deploy_verticle(Vertx vertx, VertxTestContext testContext) throws IOException {
    ServerSocket socket = new ServerSocket(0);
    port = socket.getLocalPort();
    socket.close();
    PemKeyCertOptions pemKeyCertOptions = SelfSignedCertificate.create().keyCertOptions();
    DeploymentOptions options = new DeploymentOptions().setConfig(
      new JsonObject().put("KROKI_PORT", port).put("KROKI_SSL", true)
        .put("KROKI_SSL_KEY", pemKeyCertOptions.getKeyValue().toString())
        .put("KROKI_SSL_CERT", pemKeyCertOptions.getCertValue().toString()));
    vertx.deployVerticle(new Server(), options, testContext.succeedingThenComplete());
  }

  @Test
  void http_server_check_response_fail(Vertx vertx, VertxTestContext testContext) {
    WebClient client = WebClient.create(vertx);
    client.get(port, "localhost", "/")
      .as(BodyCodec.string())
      .send(testContext.failing(response -> testContext.verify(testContext::completeNow)));
  }

  @Test
  void http_server_check_response_success(Vertx vertx, VertxTestContext testContext) {
    WebClientOptions options = new WebClientOptions();
    options.setSsl(true);
    options.setTrustAll(true);
    WebClient client = WebClient.create(vertx, options);
    client.get(port, "localhost", "/")
      .as(BodyCodec.string())
      .send(testContext.succeeding(response -> testContext.verify(() -> {
        assertThat(response.body()).contains("https://kroki.io");
        testContext.completeNow();
      })));
  }
}
