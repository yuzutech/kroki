package io.kroki.server;

import io.vertx.core.*;
import io.vertx.core.json.JsonObject;
import io.vertx.core.net.PemKeyCertOptions;
import io.vertx.core.net.SelfSignedCertificate;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import io.vertx.ext.web.codec.BodyCodec;
import io.vertx.junit5.VertxExtension;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;

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
  void with_ssl_disabled(Vertx vertx) throws TimeoutException {
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslDisabled())).await(5, TimeUnit.SECONDS);

    WebClient client = WebClient.create(vertx);
    HttpResponse<String> response = client
      .get(port, "localhost", "/")
      .as(BodyCodec.string())
      .send()
      .await(5, TimeUnit.SECONDS);
    assertThat(response.body()).contains("https://kroki.io");
  }

  @Test
  void with_ssl_enabled_by_string_and_secure_http_web_client(Vertx vertx) throws TimeoutException {
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByString(vertx))).await(5, TimeUnit.SECONDS);

    WebClientOptions options = new WebClientOptions();
    options.setSsl(true);
    options.setTrustAll(true);
    WebClient client = WebClient.create(vertx, options);
    HttpResponse<String> response = client
      .get(port, "localhost", "/")
      .as(BodyCodec.string())
      .send()
      .await(5, TimeUnit.SECONDS);
    assertThat(response.body()).contains("https://kroki.io");
  }

  @Test
  void with_ssl_enabled_by_path_and_secure_http_web_client(Vertx vertx) throws TimeoutException {
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByPath(vertx))).await(5, TimeUnit.SECONDS);

    WebClientOptions options = new WebClientOptions();
    options.setSsl(true);
    options.setTrustAll(true);
    WebClient client = WebClient.create(vertx, options);
    HttpResponse<String> response = client
      .get(port, "localhost", "/")
      .as(BodyCodec.string())
      .send()
      .await(5, TimeUnit.SECONDS);
    assertThat(response.body()).contains("https://kroki.io");
  }

  @Test
  void with_ssl_enabled_by_string_and_insecure_http_web_client(Vertx vertx) throws TimeoutException {
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByString(vertx))).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);
    // failed request, the client must send HTTPS request
    client
      .get(port, "localhost", "/")
      .as(BodyCodec.string())
      .send()
      .onComplete(
        success -> Assertions.fail("The request should have failed because the server is configured with SSL, but it succeeded."),
        failure -> {
          // verify that the request failed
          assertThat(failure).isInstanceOf(TimeoutException.class);
        });
  }

  @Test
  void with_ssl_enabled_by_path_and_insecure_http_web_client(Vertx vertx) throws TimeoutException {
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByPath(vertx))).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);
    // failed request, the client must send HTTPS request
    client
      .get(port, "localhost", "/")
      .as(BodyCodec.string())
      .send()
      .onComplete(
        success -> Assertions.fail("The request should have failed because the server is configured with SSL, but it succeeded."),
        failure -> {
          // verify that the request failed
          assertThat(failure).isInstanceOf(TimeoutException.class);
        });
  }

  @Test
  void with_ssl_enabled_by_string_and_missing_ssl_key_config(Vertx vertx) {
    Future<String> result = vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByStringMissingKey(vertx)));
    result.onComplete(
      success -> {
        Assertions.fail("The deployment should have failed because the SSL key is missing, but it succeeded.");
      },
      failure -> {
        assertThat(failure).isInstanceOf(IllegalArgumentException.class);
        assertThat(failure).hasMessage("KROKI_SSL_KEY or KROKI_SSL_KEY_PATH must be configured when SSL is enabled.");
      }
    );
  }

  @Test
  void with_ssl_enabled_by_path_and_missing_ssl_key_config(Vertx vertx) {
    Future<String> result = vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByPathMissingKey(vertx)));
    result.onComplete(
      success -> {
        Assertions.fail("The deployment should have failed because the SSL path is missing, but it succeeded.");
      },
      failure -> {
        assertThat(failure).isInstanceOf(IllegalArgumentException.class);
        assertThat(failure).hasMessage("KROKI_SSL_KEY or KROKI_SSL_KEY_PATH must be configured when SSL is enabled.");
      }
    );
  }

  @Test
  void with_ssl_enabled_by_string_and_missing_ssl_cert_config(Vertx vertx) {
    Future<String> result = vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByStringMissingCert(vertx)));
    result.onComplete(
      success -> {
        Assertions.fail("The deployment should have failed because the SSL certificate is missing, but it succeeded.");
      },
      failure -> {
        assertThat(failure).isInstanceOf(IllegalArgumentException.class);
        assertThat(failure).hasMessage("KROKI_SSL_CERT or KROKI_SSL_CERT_PATH must be configured when SSL is enabled.");
      }
    );
  }

  @Test
  void with_ssl_enabled_by_path_and_missing_ssl_cert_config(Vertx vertx) {

    Future<String> result = vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(configWithSslEnabledByPathMissingCert(vertx)));
    result.onComplete(
      success -> {
        Assertions.fail("The deployment should have failed because the SSL certificate is missing, but it succeeded.");
      },
      failure -> {
        assertThat(failure).isInstanceOf(IllegalArgumentException.class);
        assertThat(failure).hasMessage("KROKI_SSL_CERT or KROKI_SSL_CERT_PATH must be configured when SSL is enabled.");
      }
    );
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
