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
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.*;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(VertxExtension.class)
public class OpenApiTest {

  private static final Set<String> HTTP_METHODS = Set.of("get", "put", "post", "delete", "options", "head", "patch", "trace");

  private static Router router;
  private static JsonObject spec;

  @BeforeAll
  static void build_the_document_once(Vertx vertx) throws Exception {
    router = createRouter(vertx, new JsonObject());
    spec = fetchSpec(vertx, router);
  }

  /**
   * Fails when a route is added to (or removed from) the router without updating the OpenAPI
   * document, typically a new fixed endpoint missing from {@code openapi/base.json}.
   */
  @Test
  void every_route_is_documented_and_every_documented_route_exists() {
    assertRoutesMatchTheDocument(router, spec);
  }

  /**
   * The companion discovery endpoints (/services*) are an internal, token-protected API used by
   * companion containers to register themselves: they are deliberately left out of the document.
   */
  @Test
  void should_not_document_the_companion_discovery_endpoints(Vertx vertx) throws Exception {
    Router discoveryRouter = createRouter(vertx, new JsonObject()
      .put("KROKI_ENABLE_COMPANION_DISCOVERY", true)
      .put("KROKI_SAFE_MODE", "unsafe")
      .put("KROKI_COMPANION_REGISTRATION_TOKEN", "secret"));
    JsonObject discoverySpec = fetchSpec(vertx, discoveryRouter);

    assertThat(routedOperations(discoveryRouter)).anyMatch(operation -> operation.contains(" /services"));
    assertThat(discoverySpec.getJsonObject("paths").fieldNames()).noneMatch(path -> path.startsWith("/services"));
    assertRoutesMatchTheDocument(discoveryRouter, discoverySpec);
  }

  private static void assertRoutesMatchTheDocument(Router router, JsonObject spec) {
    Set<String> documented = documentedOperations(spec);
    Set<String> routed = new TreeSet<>(routedOperations(router));
    routed.removeIf(operation -> operation.contains(" /services"));
    Set<String> undocumented = new TreeSet<>(routed);
    undocumented.removeAll(documented);
    Set<String> unrouted = new TreeSet<>(documented);
    unrouted.removeAll(routed);
    assertThat(undocumented).as("routes missing from the OpenAPI document (src/main/resources/openapi/base.json)").isEmpty();
    assertThat(unrouted).as("OpenAPI operations without a matching route").isEmpty();
  }

  @Test
  void should_document_the_formats_supported_by_each_diagram() {
    JsonObject paths = spec.getJsonObject("paths");

    assertThat(outputFormats(paths, "/mermaid/{output_format}/{source_encoded}")).containsExactly("png", "svg");
    assertThat(outputFormats(paths, "/plantuml/{output_format}/{source_encoded}")).containsExactly("png", "svg", "pdf", "base64", "txt", "utxt");
  }

  @Test
  void should_document_flags_as_strings_enabled_by_presence() {
    JsonArray parameters = spec.getJsonObject("paths")
      .getJsonObject("/blockdiag/{output_format}/{source_encoded}")
      .getJsonObject("get").getJsonArray("parameters");

    JsonObject flag = parameter(parameters, "query", "antialias");
    assertThat(flag.getJsonObject("schema").getString("type")).isEqualTo("string");
    assertThat(flag.getString("description")).contains("Enabled by its presence");
  }

  @Test
  void should_mention_the_option_headers_once_per_operation_instead_of_one_parameter_per_option() {
    operations(spec).forEach((label, operation) -> {
      if (label.equals("POST /") || !operation.containsKey("tags")) {
        return; // fixed endpoints
      }
      assertThat(operation.getString("description")).as(label).contains("Kroki-Diagram-Options-<name>");
      assertThat(inlineParameters(operation)).as(label).noneMatch(parameter -> "header".equals(parameter.getString("in")));
    });
  }

  @Test
  void should_list_the_registered_diagram_types_in_the_generic_endpoint() {
    JsonArray diagramTypes = spec.getJsonObject("paths").getJsonObject("/").getJsonObject("post")
      .getJsonObject("requestBody").getJsonObject("content").getJsonObject("application/json")
      .getJsonObject("schema").getJsonObject("properties").getJsonObject("diagram_type").getJsonArray("enum");
    assertThat(diagramTypes).contains("plantuml", "mermaid", "graphviz");
  }

  @Test
  void should_document_value_options_as_plain_strings() {
    JsonArray parameters = spec.getJsonObject("paths")
      .getJsonObject("/blockdiag/{output_format}/{source_encoded}")
      .getJsonObject("get").getJsonArray("parameters");

    JsonObject size = parameter(parameters, "query", "size");
    assertThat(size.getJsonObject("schema").getString("type")).isEqualTo("string");
    assertThat(size.getString("description")).doesNotContain("Enabled by its presence");
  }

  @Test
  void should_mention_output_formats_only_when_an_option_is_restricted() {
    JsonArray parameters = spec.getJsonObject("paths")
      .getJsonObject("/blockdiag/{output_format}/{source_encoded}")
      .getJsonObject("get").getJsonArray("parameters");

    assertThat(parameter(parameters, "query", "no-transparency").getString("description"))
      .contains("Applies to output formats: png");
    assertThat(parameter(parameters, "query", "size").getString("description"))
      .doesNotContain("Applies to output formats");
  }

  @Test
  void should_document_flags_in_the_json_body_too() {
    JsonObject options = requestDiagramOptions(
      spec.getJsonObject("paths").getJsonObject("/blockdiag").getJsonObject("post"));

    JsonObject antialias = options.getJsonObject("properties").getJsonObject("antialias");
    assertThat(antialias.getString("type")).isEqualTo("string");
    assertThat(antialias.getString("description")).contains("Enabled by its presence");
  }

  @Test
  void should_document_enum_defaults_in_json_body() {
    JsonObject options = requestDiagramOptions(
      spec.getJsonObject("paths").getJsonObject("/structurizr").getJsonObject("post"));

    JsonObject output = options.getJsonObject("properties").getJsonObject("output");
    assertThat(output.getString("type")).isEqualTo("string");
    assertThat(output.getJsonArray("enum")).containsExactly("diagram", "legend");
    assertThat(output.getString("default")).isEqualTo("diagram");
  }

  @Test
  void should_describe_prefix_options_without_creating_parameters() {
    JsonObject paths = spec.getJsonObject("paths");

    JsonObject graphviz = paths.getJsonObject("/graphviz").getJsonObject("post");
    JsonObject options = requestDiagramOptions(graphviz);
    assertThat(options.containsKey("patternProperties")).isFalse(); // only valid in OpenAPI 3.1
    assertThat(options.getString("description"))
      .contains("node-attribute-")
      .contains("graph-attribute-")
      .contains("edge-attribute-")
      .contains("default node attribute");

    // a prefix can't be a query parameter name
    JsonArray parameters = graphviz.getJsonArray("parameters");
    assertThat(parameters.stream().map(JsonObject.class::cast).map(p -> p.getString("name")))
      .noneMatch(name -> name != null && name.contains("-attribute-"));
  }

  @Test
  void should_generate_unique_operation_ids() {
    List<String> ids = operations(spec).values().stream()
      .map(operation -> operation.getString("operationId")).toList();
    assertThat(ids).doesNotContainNull().doesNotHaveDuplicates();
  }

  @Test
  void should_type_every_inline_parameter() {
    operations(spec).forEach((label, operation) -> inlineParameters(operation).forEach(parameter -> {
      String where = label + " " + parameter.getString("in") + " " + parameter.getString("name");
      assertThat(parameter.getJsonObject("schema").getString("type")).as(where).isNotNull();
      // deprecated in OpenAPI 3.1
      assertThat(parameter.containsKey("allowEmptyValue")).as(where).isFalse();
    }));
  }

  @Test
  void should_only_default_to_an_allowed_enum_value() {
    operations(spec).forEach((label, operation) -> inlineParameters(operation).forEach(parameter -> {
      JsonObject schema = parameter.getJsonObject("schema");
      if (schema.containsKey("enum") && schema.containsKey("default")) {
        assertThat(schema.getJsonArray("enum").getList())
          .as(label + " " + parameter.getString("name")).contains(schema.getValue("default"));
      }
    }));
  }

  @Test
  void should_not_leak_null_or_blank_descriptions() {
    operations(spec).forEach((label, operation) -> {
      assertThat(operation.getString("description", "")).as(label).doesNotContain("`null`");
      inlineParameters(operation).forEach(parameter -> {
        if (parameter.containsKey("description")) {
          assertThat(parameter.getString("description")).as(label).isNotBlank();
        }
      });
    });
  }

  @Test
  void should_not_document_operations_without_output_formats() {
    operations(spec).forEach((label, operation) ->
      inlineParameters(operation).stream()
        .filter(parameter -> "output_format".equals(parameter.getString("name")))
        .forEach(parameter -> assertThat(parameter.getJsonObject("schema").getJsonArray("enum"))
          .as(label).isNotEmpty()));
  }

  @Test
  void should_generate_a_stable_document(Vertx vertx) throws Exception {
    JsonObject second = fetchSpec(vertx, router);
    assertThat(second.encode()).isEqualTo(spec.encode()); // sorted, so diffs and caching stay meaningful
  }

  private static Map<String, JsonObject> operations(JsonObject spec) {
    Map<String, JsonObject> operations = new LinkedHashMap<>();
    JsonObject paths = spec.getJsonObject("paths");
    for (String path : paths.fieldNames()) {
      JsonObject item = paths.getJsonObject(path);
      for (String method : List.of("get", "post")) {
        JsonObject operation = item.getJsonObject(method);
        if (operation != null) {
          operations.put(method.toUpperCase() + " " + path, operation);
        }
      }
    }
    return operations;
  }

  private static List<JsonObject> inlineParameters(JsonObject operation) {
    JsonArray parameters = operation.getJsonArray("parameters");
    if (parameters == null) {
      return List.of();
    }
    return parameters.stream().map(JsonObject.class::cast)
      .filter(parameter -> !parameter.containsKey("$ref")) // shared components are tested separately
      .toList();
  }

  private static JsonObject parameter(JsonArray parameters, String in, String name) {
    return parameters.stream().map(JsonObject.class::cast)
      .filter(parameter -> in.equals(parameter.getString("in")) && name.equals(parameter.getString("name")))
      .findFirst().orElseThrow(() -> new AssertionError("Missing " + in + " parameter " + name));
  }

  private static JsonObject requestDiagramOptions(JsonObject operation) {
    return operation.getJsonObject("requestBody").getJsonObject("content").getJsonObject("application/json")
      .getJsonObject("schema").getJsonObject("properties").getJsonObject("diagram_options");
  }

  private static Router createRouter(Vertx vertx, JsonObject config) {
    return Server.createRouter(vertx, new VertxOptions(), config, new ErrorHandler(vertx, false));
  }

  private static JsonArray outputFormats(JsonObject paths, String path) {
    return parameter(paths.getJsonObject(path).getJsonObject("get").getJsonArray("parameters"), "path", "output_format")
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
