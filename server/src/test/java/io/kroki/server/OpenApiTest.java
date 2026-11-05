package io.kroki.server;

import io.kroki.server.error.ErrorHandler;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Route;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.client.WebClient;
import io.vertx.junit5.VertxExtension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(VertxExtension.class)
public class OpenApiTest {

  private static final Set<String> HTTP_METHODS = Set.of("get", "put", "post", "delete", "options", "head", "patch", "trace");

  /**
   * Fails when a route is added to (or removed from) the router without updating the OpenAPI
   * document, typically a new fixed endpoint missing from {@code openapi/base.json}.
   */
  @Test
  void every_route_is_documented_and_every_documented_route_exists(Vertx vertx) throws Exception {
    JsonObject config = new JsonObject();
    Router router = Server.createRouter(vertx, new VertxOptions(), config, new ErrorHandler(vertx, false));
    JsonObject spec = fetchSpec(vertx, router);

    Set<String> documented = documentedOperations(spec);
    Set<String> routed = routedOperations(router);
    Set<String> undocumented = new TreeSet<>(routed);
    undocumented.removeAll(documented);
    Set<String> unrouted = new TreeSet<>(documented);
    unrouted.removeAll(routed);
    assertThat(undocumented).as("routes missing from the OpenAPI document (src/main/resources/openapi/base.json)").isEmpty();
    assertThat(unrouted).as("OpenAPI operations without a matching route").isEmpty();
  }

  @Test
  void should_document_the_formats_supported_by_each_diagram(Vertx vertx) throws Exception {
    Router router = Server.createRouter(vertx, new VertxOptions(), new JsonObject(), new ErrorHandler(vertx, false));
    JsonObject paths = fetchSpec(vertx, router).getJsonObject("paths");

    assertThat(outputFormats(paths, "/mermaid/{output_format}/{source_encoded}")).containsExactly("png", "svg");
    assertThat(outputFormats(paths, "/plantuml/{output_format}/{source_encoded}")).containsExactly("png", "svg", "pdf", "base64", "txt", "utxt");
  }

  private static JsonArray outputFormats(JsonObject paths, String path) {
    return paths.getJsonObject(path).getJsonObject("get").getJsonArray("parameters").getJsonObject(0)
      .getJsonObject("schema").getJsonArray("enum");
  }

  private static JsonObject fetchSpec(Vertx vertx, Router router) throws Exception {
    var server = vertx.createHttpServer().requestHandler(router).listen(0).await(5, TimeUnit.SECONDS);
    try {
      var response = WebClient.create(vertx).get(server.actualPort(), "localhost", "/openapi.json")
        .send().await(5, TimeUnit.SECONDS);
      assertThat(response.statusCode()).isEqualTo(200);
      return response.bodyAsJsonObject();
    } finally {
      server.close().await(5, TimeUnit.SECONDS);
    }
  }

  /**
   * @return "METHOD /path/{param}" for every route bound to an explicit path and HTTP method.
   * Method-agnostic routes (CORS, 405 guards, catch-all 404) are not API operations.
   */
  private static Set<String> routedOperations(Router router) {
    Set<String> operations = new TreeSet<>();
    for (Route route : router.getRoutes()) {
      if (route.getPath() == null || route.methods() == null || route.methods().isEmpty()) {
        continue;
      }
      String path = route.getPath().replaceAll(":([A-Za-z0-9_]+)", "{$1}");
      route.methods().forEach(method -> operations.add(method.name() + " " + path));
    }
    return operations;
  }

  private static Set<String> documentedOperations(JsonObject spec) {
    Set<String> operations = new TreeSet<>();
    JsonObject paths = spec.getJsonObject("paths");
    for (String path : paths.fieldNames()) {
      JsonObject pathItem = resolve(spec, paths.getJsonObject(path));
      for (String key : pathItem.fieldNames()) {
        if (HTTP_METHODS.contains(key)) {
          operations.add(key.toUpperCase() + " " + path);
        }
      }
    }
    return operations;
  }

  private static JsonObject resolve(JsonObject spec, JsonObject node) {
    String ref = node.getString("$ref");
    if (ref == null) {
      return node;
    }
    JsonObject target = spec;
    for (String segment : ref.substring(2).split("/")) {
      target = target.getJsonObject(segment);
    }
    return target;
  }
}
