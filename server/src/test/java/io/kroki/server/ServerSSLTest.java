package io.kroki.server;

import static org.assertj.core.api.Assertions.assertThat;

import io.vertx.core.AsyncResult;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Handler;
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
  void with_ssl_disabled(Vertx vertx, VertxTestContext testContext) {
    Handler<AsyncResult<String>> handle = deployVerticleResult -> {
      // successful deployment
      testContext.verify(() -> assertThat(deployVerticleResult.failed()).isFalse());
      WebClient client = WebClient.create(vertx);
      // successful request
      client
        .get(port, "localhost", "/")
        .as(BodyCodec.string())
        .send(testContext.succeeding(response -> testContext.verify(() -> {
          assertThat(response.body()).contains("https://kroki.io");
          testContext.completeNow();
        })));
    };
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslDisabled()), handle);
  }

  @Test
  void with_ssl_enabled_by_string_and_secure_http_web_client(Vertx vertx, VertxTestContext testContext) {
    Handler<AsyncResult<String>> handle = deployVerticleResult -> {
      // successful deployment
      testContext.verify(() -> assertThat(deployVerticleResult.failed()).isFalse());
      WebClientOptions options = new WebClientOptions();
      options.setSsl(true);
      options.setTrustAll(true);
      WebClient client = WebClient.create(vertx, options);
      // successful request
      client
        .get(port, "localhost", "/")
        .as(BodyCodec.string())
        .send(testContext.succeeding(response -> testContext.verify(() -> {
          assertThat(response.body()).contains("https://kroki.io");
          testContext.completeNow();
        })));
    };
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByString(vertx)), handle);
  }

  @Test
  void with_ssl_enabled_by_path_and_secure_http_web_client(Vertx vertx, VertxTestContext testContext) {
    Handler<AsyncResult<String>> handle = deployVerticleResult -> {
      // successful deployment
      testContext.verify(() -> assertThat(deployVerticleResult.failed()).isFalse());
      WebClientOptions options = new WebClientOptions();
      options.setSsl(true);
      options.setTrustAll(true);
      WebClient client = WebClient.create(vertx, options);
      // successful request
      client
        .get(port, "localhost", "/")
        .as(BodyCodec.string())
        .send(testContext.succeeding(response -> testContext.verify(() -> {
          assertThat(response.body()).contains("https://kroki.io");
          testContext.completeNow();
        })));
    };
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByPath(vertx)), handle);
  }

  @Test
  void with_ssl_enabled_by_string_and_insecure_http_web_client(Vertx vertx, VertxTestContext testContext) {
    Handler<AsyncResult<String>> handle = deployVerticleResult -> {
      // successful deployment
      testContext.verify(() -> assertThat(deployVerticleResult.failed()).isFalse());
      WebClient client = WebClient.create(vertx);
      // failed request, client must send HTTPS request
      client
        .get(port, "localhost", "/")
        .as(BodyCodec.string())
        .send(testContext.failing(response -> testContext.verify(testContext::completeNow)));
    };
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByString(vertx)), handle);
  }

  @Test
  void with_ssl_enabled_by_path_and_insecure_http_web_client(Vertx vertx, VertxTestContext testContext) {
    Handler<AsyncResult<String>> handle = deployVerticleResult -> {
      // successful deployment
      testContext.verify(() -> assertThat(deployVerticleResult.failed()).isFalse());
      WebClient client = WebClient.create(vertx);
      // failed request, client must send HTTPS request
      client
        .get(port, "localhost", "/")
        .as(BodyCodec.string())
        .send(testContext.failing(response -> testContext.verify(testContext::completeNow)));
    };
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByPath(vertx)), handle);
  }

  @Test
  void with_ssl_enabled_by_string_and_missing_ssl_key_config(Vertx vertx, VertxTestContext testContext) {
    Handler<AsyncResult<String>> handle = deployVerticleResult -> {
      // failed deployment
      testContext.verify(() -> {
        assertThat(deployVerticleResult.failed()).isTrue();
        assertThat(deployVerticleResult.cause()).isInstanceOf(IllegalArgumentException.class);
        assertThat(deployVerticleResult.cause()).hasMessage("KROKI_SSL_KEY or KROKI_SSL_KEY_PATH must be configured when SSL is enabled.");
      });
      WebClientOptions options = new WebClientOptions();
      options.setSsl(true);
      options.setTrustAll(true);
      WebClient client = WebClient.create(vertx, options);
      // failed request, server has not started
      client
        .get(port, "localhost", "/")
        .as(BodyCodec.string())
        .send(testContext.failing(response -> testContext.verify(testContext::completeNow)));
    };
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByStringMissingKey(vertx)), handle);
  }

  @Test
  void with_ssl_enabled_by_path_and_missing_ssl_key_config(Vertx vertx, VertxTestContext testContext) {
    Handler<AsyncResult<String>> handle = deployVerticleResult -> {
      // failed deployment
      testContext.verify(() -> {
        assertThat(deployVerticleResult.failed()).isTrue();
        assertThat(deployVerticleResult.cause()).isInstanceOf(IllegalArgumentException.class);
        assertThat(deployVerticleResult.cause()).hasMessage("KROKI_SSL_KEY or KROKI_SSL_KEY_PATH must be configured when SSL is enabled.");
      });
      WebClientOptions options = new WebClientOptions();
      options.setSsl(true);
      options.setTrustAll(true);
      WebClient client = WebClient.create(vertx, options);
      // failed request, server has not started
      client
        .get(port, "localhost", "/")
        .as(BodyCodec.string())
        .send(testContext.failing(response -> testContext.verify(testContext::completeNow)));
    };
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByPathMissingKey(vertx)), handle);
  }

  @Test
  void with_ssl_enabled_by_string_and_missing_ssl_cert_config(Vertx vertx, VertxTestContext testContext) {
    Handler<AsyncResult<String>> handle = deployVerticleResult -> {
      // failed deployment
      testContext.verify(() -> {
        assertThat(deployVerticleResult.failed()).isTrue();
        assertThat(deployVerticleResult.cause()).isInstanceOf(IllegalArgumentException.class);
        assertThat(deployVerticleResult.cause()).hasMessage("KROKI_SSL_CERT or KROKI_SSL_CERT_PATH must be configured when SSL is enabled.");
      });
      WebClientOptions options = new WebClientOptions();
      options.setSsl(true);
      options.setTrustAll(true);
      WebClient client = WebClient.create(vertx, options);
      // failed request, server has not started
      client
        .get(port, "localhost", "/")
        .as(BodyCodec.string())
        .send(testContext.failing(response -> testContext.verify(testContext::completeNow)));
    };
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByStringMissingCert(vertx)), handle);
  }

  @Test
  void with_ssl_enabled_by_path_and_missing_ssl_cert_config(Vertx vertx, VertxTestContext testContext) {
    Handler<AsyncResult<String>> handle = deployVerticleResult -> {
      // failed deployment
      testContext.verify(() -> {
        assertThat(deployVerticleResult.failed()).isTrue();
        assertThat(deployVerticleResult.cause()).isInstanceOf(IllegalArgumentException.class);
        assertThat(deployVerticleResult.cause()).hasMessage("KROKI_SSL_CERT or KROKI_SSL_CERT_PATH must be configured when SSL is enabled.");
      });
      WebClientOptions options = new WebClientOptions();
      options.setSsl(true);
      options.setTrustAll(true);
      WebClient client = WebClient.create(vertx, options);
      // failed request, server has not started
      client
        .get(port, "localhost", "/")
        .as(BodyCodec.string())
        .send(testContext.failing(response -> testContext.verify(testContext::completeNow)));
    };
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByPathMissingCert(vertx)), handle);
  }

  private JsonObject configWithSslDisabled() {
    return new JsonObject()
      .put("KROKI_PORT", port)
      .put("KROKI_SSL", false);
  }

  private JsonObject configWithSslEnabledByStringMissingKey(Vertx vertx) {
    JsonObject config = configWithSslEnabledByString(vertx);
    config.remove("KROKI_SSL_KEY");
    return config;
  }

  private JsonObject configWithSslEnabledByStringMissingCert(Vertx vertx) {
    JsonObject config = configWithSslEnabledByString(vertx);
    config.remove("KROKI_SSL_CERT");
    return config;
  }

  private JsonObject configWithSslEnabledByString(Vertx vertx) {
    return new JsonObject()
      .put("KROKI_PORT", port)
      .put("KROKI_SSL", true)
      .put("KROKI_SSL_KEY", vertx.fileSystem().readFileBlocking(pemKeyCertOptions.getKeyPath()).toString())
      .put("KROKI_SSL_CERT", vertx.fileSystem().readFileBlocking(pemKeyCertOptions.getCertPath()).toString());
  }

  private JsonObject configWithSslEnabledByPathMissingKey(Vertx vertx) {
    JsonObject config = configWithSslEnabledByPath(vertx);
    config.remove("KROKI_SSL_KEY_PATH");
    return config;
  }

  private JsonObject configWithSslEnabledByPathMissingCert(Vertx vertx) {
    JsonObject config = configWithSslEnabledByPath(vertx);
    config.remove("KROKI_SSL_CERT_PATH");
    return config;
  }

  private JsonObject configWithSslEnabledByPath(Vertx vertx) {
    return new JsonObject()
      .put("KROKI_PORT", port)
      .put("KROKI_SSL", true)
      .put("KROKI_SSL_KEY_PATH", pemKeyCertOptions.getKeyPath())
      .put("KROKI_SSL_CERT_PATH", pemKeyCertOptions.getCertPath());
  }
}
