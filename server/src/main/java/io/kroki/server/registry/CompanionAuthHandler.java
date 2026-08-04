package io.kroki.server.registry;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Guards the {@code /services} management API with a shared-secret bearer token, when configured
 * via {@code KROKI_COMPANION_REGISTRATION_TOKEN}. Without a token configured, any client able to
 * reach the gateway can register a companion service, which is only appropriate on a trusted
 * network (e.g. a private Docker/Kubernetes network with no external route to the gateway).
 */
public class CompanionAuthHandler implements Handler<RoutingContext> {

  private static final String BEARER_PREFIX = "Bearer ";

  private final String token;

  public CompanionAuthHandler(String token) {
    this.token = token;
  }

  @Override
  public void handle(RoutingContext routingContext) {
    String authorization = routingContext.request().getHeader("Authorization");
    if (authorization != null && authorization.startsWith(BEARER_PREFIX) && constantTimeEquals(authorization.substring(BEARER_PREFIX.length()), token)) {
      routingContext.next();
      return;
    }
    routingContext.response()
      .setStatusCode(401)
      .putHeader("WWW-Authenticate", "Bearer")
      .putHeader("Content-Type", "application/json")
      .end("{\"error\":\"Missing or invalid bearer token.\"}");
  }

  private static boolean constantTimeEquals(String a, String b) {
    return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
  }
}
