package io.kroki.server.registry;

import io.kroki.server.error.BadRequestException;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.DecodeException;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

/**
 * REST API used by companion containers to register themselves, heartbeat, and look up
 * registrations (see issue #1423). Mounted under {@code /services} only when
 * {@code KROKI_ENABLE_COMPANION_DISCOVERY} is enabled.
 */
public class CompanionServiceHandler {

  private final CompanionRegistry companionRegistry;

  public CompanionServiceHandler(CompanionRegistry companionRegistry) {
    this.companionRegistry = companionRegistry;
  }

  public Handler<RoutingContext> createRegister() {
    return routingContext -> {
      JsonObject payload = readJsonBody(routingContext);
      if (payload == null) {
        return;
      }
      CompanionRegistration registration = companionRegistry.register(payload);
      routingContext.response()
        .setStatusCode(201)
        .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
        .putHeader(HttpHeaders.LOCATION, "/services/" + registration.getName())
        .end(registration.toJson().encode());
    };
  }

  public Handler<RoutingContext> createHeartbeat() {
    return routingContext -> {
      String name = routingContext.pathParam("name");
      companionRegistry.heartbeat(name).ifPresentOrElse(
        registration -> routingContext.response()
          .setStatusCode(200)
          .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
          .end(registration.toJson().encode()),
        () -> {
          JsonObject notFound = new JsonObject()
            .put("error", "Service '" + name + "' is not registered.")
            .put("_links", new JsonObject().put("register", new JsonObject()
              .put("href", "/services")
              .put("method", "POST")));
          routingContext.response()
            .setStatusCode(404)
            .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
            .end(notFound.encode());
        }
      );
    };
  }

  public Handler<RoutingContext> createGet() {
    return routingContext -> {
      String name = routingContext.pathParam("name");
      companionRegistry.get(name).ifPresentOrElse(
        registration -> routingContext.response()
          .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
          .end(registration.toJson().encode()),
        () -> routingContext.fail(404)
      );
    };
  }

  public Handler<RoutingContext> createList() {
    return routingContext -> {
      JsonArray services = new JsonArray();
      companionRegistry.list().forEach(registration -> services.add(registration.toJson()));
      routingContext.response()
        .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
        .end(services.encode());
    };
  }

  public Handler<RoutingContext> createUnregister() {
    return routingContext -> {
      String name = routingContext.pathParam("name");
      if (companionRegistry.unregister(name)) {
        routingContext.response().setStatusCode(204).end();
      } else {
        routingContext.fail(404);
      }
    };
  }

  private JsonObject readJsonBody(RoutingContext routingContext) {
    String bodyAsString = routingContext.body().asString();
    if (bodyAsString == null || bodyAsString.trim().isEmpty()) {
      routingContext.fail(new BadRequestException("Request body must not be empty."));
      return null;
    }
    try {
      return new JsonObject(bodyAsString);
    } catch (DecodeException e) {
      routingContext.fail(new BadRequestException("Request body must be a valid JSON object.", e));
      return null;
    }
  }
}
