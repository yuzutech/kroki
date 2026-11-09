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

@ExtendWith(VertxExtension.class)
public class ServerContentSecurityPolicyTest {

  private static final Logger logger = LoggerFactory.getLogger(ServerContentSecurityPolicyTest.class);

  @Test
  void with_default_content_security_policy(Vertx vertx) throws TimeoutException {
    if (available(8000)) {
      vertx.deployVerticle(new Server(), new DeploymentOptions()).await(5, TimeUnit.SECONDS);
      WebClient client = WebClient.create(vertx);

      HttpResponse<Buffer> response = get(client, "/health");
      assertThat(response.statusCode()).isEqualTo(200);
      assertThat(response.getHeader("Content-Security-Policy")).isEqualTo("script-src 'none'; object-src 'none'");

      // error responses can also be rendered as SVG
      HttpResponse<Buffer> errorResponse = get(client, "/goat/svg/invalid?svg-color-dark-scheme=%3C%2Fstyle%3E");
      assertThat(errorResponse.statusCode()).isEqualTo(400);
      assertThat(errorResponse.getHeader("Content-Security-Policy")).isEqualTo("script-src 'none'; object-src 'none'");
    } else {
      logger.warn("Port 8000 is not available, skipping test");
    }
  }

  @Test
  void with_custom_content_security_policy(Vertx vertx) throws TimeoutException {
    if (available(8000)) {
      JsonObject config = new JsonObject().put("KROKI_CONTENT_SECURITY_POLICY", "default-src 'none'; style-src 'unsafe-inline'");
      vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
      WebClient client = WebClient.create(vertx);

      HttpResponse<Buffer> response = get(client, "/health");
      assertThat(response.getHeader("Content-Security-Policy")).isEqualTo("default-src 'none'; style-src 'unsafe-inline'");
    } else {
      logger.warn("Port 8000 is not available, skipping test");
    }
  }

  @Test
  void without_content_security_policy(Vertx vertx) throws TimeoutException {
    if (available(8000)) {
      JsonObject config = new JsonObject().put("KROKI_CONTENT_SECURITY_POLICY", "");
      vertx.deployVerticle(new Server(), new DeploymentOptions().setConfig(config)).await(5, TimeUnit.SECONDS);
      WebClient client = WebClient.create(vertx);

      HttpResponse<Buffer> response = get(client, "/health");
      assertThat(response.statusCode()).isEqualTo(200);
      assertThat(response.getHeader("Content-Security-Policy")).isNull();
    } else {
      logger.warn("Port 8000 is not available, skipping test");
    }
  }

  private static HttpResponse<Buffer> get(WebClient client, String requestURI) throws TimeoutException {
    return client
      .request(HttpMethod.GET, 8000, "localhost", requestURI)
      .send()
      .await(5, TimeUnit.SECONDS);
  }
}
