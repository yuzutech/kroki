package io.kroki.server.registry;

import io.kroki.server.Server;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.junit5.VertxExtension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(VertxExtension.class)
class CompanionDiscoveryServerTest {

  private static int getAvailablePort() throws IOException {
    try (ServerSocket socket = new ServerSocket(0)) {
      return socket.getLocalPort();
    }
  }

  private static JsonObject registrationPayload(String name, int companionPort) {
    return new JsonObject()
      .put("name", name)
      .put("version", "1.2.3")
      .put("formats", new JsonArray().add("svg"))
      .put("host", "localhost")
      .put("port", companionPort);
  }

  /**
   * Discovery enabled with a non-SECURE safe mode: KROKI_SAFE_MODE defaults to SECURE (see
   * should_not_mount_services_routes_under_the_default_safe_mode_even_if_discovery_is_enabled),
   * which would otherwise keep discovery disabled regardless of KROKI_ENABLE_COMPANION_DISCOVERY.
   */
  private static JsonObject discoveryEnabledConfig(int krokiPort) {
    return new JsonObject()
      .put("KROKI_LISTEN", "127.0.0.1:" + krokiPort)
      .put("KROKI_ENABLE_COMPANION_DISCOVERY", true)
      .put("KROKI_SAFE_MODE", "SAFE");
  }

  private void startFakeCompanion(Vertx vertx, int port) throws TimeoutException {
    HttpServer companion = vertx.createHttpServer();
    companion.requestHandler(req -> req.body().onSuccess(body ->
      req.response().setStatusCode(200).end("companion-received:" + body.toString())));
    companion.listen(port, "localhost").await(5, TimeUnit.SECONDS);
  }

  @Test
  void should_register_and_delegate_to_a_companion_service(Vertx vertx) throws IOException, TimeoutException {
    int krokiPort = getAvailablePort();
    int companionPort = getAvailablePort();
    startFakeCompanion(vertx, companionPort);

    JsonObject config = discoveryEnabledConfig(krokiPort);
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);

    HttpResponse<Buffer> registerResponse = client.post(krokiPort, "localhost", "/services")
      .sendJsonObject(registrationPayload("mscgen", companionPort))
      .await(5, TimeUnit.SECONDS);
    assertThat(registerResponse.statusCode()).isEqualTo(201);
    assertThat(registerResponse.bodyAsJsonObject().getString("name")).isEqualTo("mscgen");

    HttpResponse<Buffer> convertResponse = client.post(krokiPort, "localhost", "/mscgen/svg")
      .sendBuffer(Buffer.buffer("msc { a -> b; }"))
      .await(5, TimeUnit.SECONDS);
    assertThat(convertResponse.statusCode()).isEqualTo(200);
    assertThat(convertResponse.bodyAsString()).isEqualTo("companion-received:msc { a -> b; }");

    HttpResponse<Buffer> heartbeatResponse = client.put(krokiPort, "localhost", "/services/mscgen/heartbeat")
      .send()
      .await(5, TimeUnit.SECONDS);
    assertThat(heartbeatResponse.statusCode()).isEqualTo(200);

    HttpResponse<Buffer> getResponse = client.get(krokiPort, "localhost", "/services/mscgen")
      .send()
      .await(5, TimeUnit.SECONDS);
    assertThat(getResponse.statusCode()).isEqualTo(200);
    assertThat(getResponse.bodyAsJsonObject().getJsonArray("formats")).containsExactly("svg");

    HttpResponse<Buffer> unregisterResponse = client.delete(krokiPort, "localhost", "/services/mscgen")
      .send()
      .await(5, TimeUnit.SECONDS);
    assertThat(unregisterResponse.statusCode()).isEqualTo(204);

    HttpResponse<Buffer> afterUnregisterResponse = client.post(krokiPort, "localhost", "/mscgen/svg")
      .sendBuffer(Buffer.buffer("msc { a -> b; }"))
      .await(5, TimeUnit.SECONDS);
    assertThat(afterUnregisterResponse.statusCode()).isEqualTo(404);
  }

  @Test
  void should_expose_a_registered_companion_in_health_and_homepage(Vertx vertx) throws IOException, TimeoutException {
    int krokiPort = getAvailablePort();
    int companionPort = getAvailablePort();
    startFakeCompanion(vertx, companionPort);

    JsonObject config = discoveryEnabledConfig(krokiPort);
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);

    // not registered yet: absent from both endpoints
    HttpResponse<Buffer> healthBefore = client.get(krokiPort, "localhost", "/health").send().await(5, TimeUnit.SECONDS);
    assertThat(healthBefore.bodyAsJsonObject().getJsonObject("version").containsKey("mscgen")).isFalse();

    HttpResponse<Buffer> registerResponse = client.post(krokiPort, "localhost", "/services")
      .sendJsonObject(registrationPayload("mscgen", companionPort))
      .await(5, TimeUnit.SECONDS);
    assertThat(registerResponse.statusCode()).isEqualTo(201);

    HttpResponse<Buffer> healthAfter = client.get(krokiPort, "localhost", "/health").send().await(5, TimeUnit.SECONDS);
    assertThat(healthAfter.bodyAsJsonObject().getJsonObject("version").getString("mscgen")).isEqualTo("1.2.3");

    HttpResponse<Buffer> homepageAfter = client.get(krokiPort, "localhost", "/").send().await(5, TimeUnit.SECONDS);
    assertThat(homepageAfter.bodyAsString()).contains("mscgen");

    client.delete(krokiPort, "localhost", "/services/mscgen").send().await(5, TimeUnit.SECONDS);
    HttpResponse<Buffer> healthAfterUnregister = client.get(krokiPort, "localhost", "/health").send().await(5, TimeUnit.SECONDS);
    assertThat(healthAfterUnregister.bodyAsJsonObject().getJsonObject("version").containsKey("mscgen")).isFalse();
  }

  @Test
  void should_reject_a_duplicate_registration(Vertx vertx) throws IOException, TimeoutException {
    int krokiPort = getAvailablePort();
    int companionPort = getAvailablePort();
    startFakeCompanion(vertx, companionPort);

    JsonObject config = discoveryEnabledConfig(krokiPort);
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);

    client.post(krokiPort, "localhost", "/services")
      .sendJsonObject(registrationPayload("mscgen", companionPort))
      .await(5, TimeUnit.SECONDS);
    HttpResponse<Buffer> secondAttempt = client.post(krokiPort, "localhost", "/services")
      .sendJsonObject(registrationPayload("mscgen", companionPort))
      .await(5, TimeUnit.SECONDS);
    assertThat(secondAttempt.statusCode()).isEqualTo(422);
  }

  @Test
  void should_require_a_bearer_token_when_configured(Vertx vertx) throws IOException, TimeoutException {
    int krokiPort = getAvailablePort();
    int companionPort = getAvailablePort();
    startFakeCompanion(vertx, companionPort);

    JsonObject config = discoveryEnabledConfig(krokiPort)
      .put("KROKI_COMPANION_REGISTRATION_TOKEN", "s3cr3t");
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);

    HttpResponse<Buffer> withoutToken = client.post(krokiPort, "localhost", "/services")
      .sendJsonObject(registrationPayload("mscgen", companionPort))
      .await(5, TimeUnit.SECONDS);
    assertThat(withoutToken.statusCode()).isEqualTo(401);

    HttpResponse<Buffer> withWrongToken = client.post(krokiPort, "localhost", "/services")
      .putHeader("Authorization", "Bearer wrong")
      .sendJsonObject(registrationPayload("mscgen", companionPort))
      .await(5, TimeUnit.SECONDS);
    assertThat(withWrongToken.statusCode()).isEqualTo(401);

    HttpResponse<Buffer> withCorrectToken = client.post(krokiPort, "localhost", "/services")
      .putHeader("Authorization", "Bearer s3cr3t")
      .sendJsonObject(registrationPayload("mscgen", companionPort))
      .await(5, TimeUnit.SECONDS);
    assertThat(withCorrectToken.statusCode()).isEqualTo(201);
  }

  @Test
  void should_evict_a_service_that_missed_its_heartbeat_deadline(Vertx vertx) throws IOException, TimeoutException, InterruptedException {
    int krokiPort = getAvailablePort();
    int companionPort = getAvailablePort();
    startFakeCompanion(vertx, companionPort);

    JsonObject config = discoveryEnabledConfig(krokiPort)
      .put("KROKI_COMPANION_HEARTBEAT_TTL_MS", 200)
      .put("KROKI_COMPANION_HEARTBEAT_SWEEP_INTERVAL_MS", 100);
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);

    client.post(krokiPort, "localhost", "/services")
      .sendJsonObject(registrationPayload("mscgen", companionPort))
      .await(5, TimeUnit.SECONDS);

    // wait past the heartbeat TTL and the sweep interval for the eviction to run
    Thread.sleep(1000);

    HttpResponse<Buffer> afterExpiryResponse = client.get(krokiPort, "localhost", "/services/mscgen")
      .send()
      .await(5, TimeUnit.SECONDS);
    assertThat(afterExpiryResponse.statusCode()).isEqualTo(404);
  }

  @Test
  void should_not_mount_services_routes_when_discovery_is_disabled(Vertx vertx) throws IOException, TimeoutException {
    int krokiPort = getAvailablePort();
    JsonObject config = new JsonObject().put("KROKI_LISTEN", "127.0.0.1:" + krokiPort);
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);

    HttpResponse<Buffer> response = client.post(krokiPort, "localhost", "/services")
      .sendJsonObject(registrationPayload("mscgen", 1234))
      .await(5, TimeUnit.SECONDS);
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  void should_not_mount_services_routes_under_the_default_safe_mode_even_if_discovery_is_enabled(Vertx vertx) throws IOException, TimeoutException {
    int krokiPort = getAvailablePort();
    // KROKI_SAFE_MODE deliberately left unset: it defaults to SECURE, same as kroki.io
    JsonObject config = new JsonObject()
      .put("KROKI_LISTEN", "127.0.0.1:" + krokiPort)
      .put("KROKI_ENABLE_COMPANION_DISCOVERY", true);
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);

    HttpResponse<Buffer> response = client.post(krokiPort, "localhost", "/services")
      .sendJsonObject(registrationPayload("mscgen", 1234))
      .await(5, TimeUnit.SECONDS);
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  void should_not_mount_services_routes_when_safe_mode_is_explicitly_secure(Vertx vertx) throws IOException, TimeoutException {
    int krokiPort = getAvailablePort();
    JsonObject config = new JsonObject()
      .put("KROKI_LISTEN", "127.0.0.1:" + krokiPort)
      .put("KROKI_ENABLE_COMPANION_DISCOVERY", true)
      .put("KROKI_SAFE_MODE", "SECURE");
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);

    HttpResponse<Buffer> response = client.post(krokiPort, "localhost", "/services")
      .sendJsonObject(registrationPayload("mscgen", 1234))
      .await(5, TimeUnit.SECONDS);
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  void should_mount_services_routes_when_safe_mode_is_not_secure(Vertx vertx) throws IOException, TimeoutException {
    int krokiPort = getAvailablePort();
    int companionPort = getAvailablePort();
    startFakeCompanion(vertx, companionPort);
    JsonObject config = discoveryEnabledConfig(krokiPort);
    vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
    WebClient client = WebClient.create(vertx);

    HttpResponse<Buffer> response = client.post(krokiPort, "localhost", "/services")
      .sendJsonObject(registrationPayload("mscgen", companionPort))
      .await(5, TimeUnit.SECONDS);
    assertThat(response.statusCode()).isEqualTo(201);
  }
}
