package io.kroki.server.service;

import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.TreeSet;

/**
 * Serves the OpenAPI document of this Kroki instance.
 *
 * <p>The static part (info, shared components, fixed endpoints such as /health) lives in
 * {@code openapi/base.json}. The diagram conversion paths are generated on every request from
 * the {@link DiagramRegistry}, so that each diagram type documents its own supported output
 * formats and companion services registered at runtime (#1423) show up without a restart.
 */
public class OpenApiHandler {

  private static final String REF_PREFIX = "#/components/";

  private final DiagramRegistry registry;
  private final String version;
  private final JsonObject base;

  public OpenApiHandler(DiagramRegistry registry, String version) {
    this.registry = registry;
    this.version = version;
    this.base = readBase();
  }

  public Handler<RoutingContext> create() {
    return routingContext -> routingContext.response()
      .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
      .end(build().encodePrettily());
  }

  JsonObject build() {
    JsonObject spec = base.copy();
    spec.getJsonObject("info").put("version", version);
    JsonObject paths = spec.getJsonObject("paths");
    // sorted for a stable output
    for (String name : new TreeSet<>(registry.names())) {
      DiagramHandler handler = registry.get(name);
      if (handler == null) {
        continue; // unregistered concurrently
      }
      DiagramService service = handler.getService();
      List<FileFormat> formats = service.getSupportedFormats();
      String description = "Diagram library version: `" + service.getVersion() + "`.";

      paths.put("/" + name + "/{output_format}/{source_encoded}", new JsonObject()
        .put("get", operation(name, "get" + pascal(name), "Convert a " + name + " diagram encoded in the URL", description, formats)
          .put("parameters", new JsonArray()
            .add(outputFormatParameter(formats))
            .add(ref("parameters/SourceEncoded")))));

      paths.put("/" + name, new JsonObject()
        .put("post", operation(name, "post" + pascal(name), "Convert a " + name + " diagram", description, formats)
          .put("requestBody", ref("requestBodies/DiagramInput"))));

      paths.put("/" + name + "/{output_format}", new JsonObject()
        .put("post", operation(name, "post" + pascal(name) + "InFormat", "Convert a " + name + " diagram to the given format", description, formats)
          .put("parameters", new JsonArray().add(outputFormatParameter(formats)))
          .put("requestBody", ref("requestBodies/DiagramInput"))));
    }
    return spec;
  }

  private static JsonObject operation(String name, String operationId, String summary, String description, List<FileFormat> formats) {
    return new JsonObject()
      .put("tags", new JsonArray().add(name))
      .put("operationId", operationId)
      .put("summary", summary)
      .put("description", description)
      .put("responses", new JsonObject()
        .put("200", renderedDiagram(formats))
        .put("default", ref("responses/Error")));
  }

  private static JsonObject outputFormatParameter(List<FileFormat> formats) {
    JsonArray values = new JsonArray();
    formats.forEach(format -> values.add(format.getName()));
    return new JsonObject()
      .put("name", "output_format")
      .put("in", "path")
      .put("required", true)
      .put("schema", new JsonObject().put("type", "string").put("enum", values));
  }

  private static JsonObject renderedDiagram(List<FileFormat> formats) {
    JsonObject content = new JsonObject();
    for (FileFormat format : formats) {
      JsonObject schema = new JsonObject().put("type", "string");
      if (format == FileFormat.PNG || format == FileFormat.JPEG || format == FileFormat.PDF) {
        schema.put("format", "binary");
      }
      content.put(ContentType.get(format), new JsonObject().put("schema", schema));
    }
    return new JsonObject().put("description", "The rendered diagram.").put("content", content);
  }

  private static JsonObject ref(String path) {
    return new JsonObject().put("$ref", REF_PREFIX + path);
  }

  private static String pascal(String name) {
    return Character.toUpperCase(name.charAt(0)) + name.substring(1);
  }

  private static JsonObject readBase() {
    try (InputStream input = OpenApiHandler.class.getResourceAsStream("/openapi/base.json")) {
      if (input == null) {
        throw new IllegalStateException("Missing resource /openapi/base.json");
      }
      return new JsonObject(new String(input.readAllBytes(), StandardCharsets.UTF_8));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
