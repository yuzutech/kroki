package io.kroki.server.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.kroki.server.option.DiagramOption;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

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
  private static final String HEADERS_NOTE = "Diagram options can also be passed as `Kroki-Diagram-Options-<name>` headers.";

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
    JsonArray diagramTypes = new JsonArray();
    // sorted for a stable output
    for (String name : new TreeSet<>(registry.names())) {
      DiagramHandler handler = registry.get(name);
      if (handler == null) {
        continue; // unregistered concurrently
      }
      if (addDiagramPaths(paths, name, handler.getService())) {
        diagramTypes.add(name);
      }
    }
    paths.getJsonObject("/").getJsonObject("post").getJsonObject("requestBody").getJsonObject("content")
      .getJsonObject("application/json").getJsonObject("schema").getJsonObject("properties")
      .getJsonObject("diagram_type").put("enum", diagramTypes);
    return spec;
  }

  /**
   * @return {@code false} when the diagram type has no output format, and is therefore not documented
   */
  private boolean addDiagramPaths(JsonObject paths, String name, DiagramService service) {
    List<FileFormat> formats = service.getSupportedFormats();
    if (formats.isEmpty()) {
      return false; // nothing to document, and an empty enum would be invalid
    }
    List<DiagramOption> options = service.getOptions();
    String libraryVersion = service.getVersion();
    String description = libraryVersion == null || libraryVersion.isBlank()
      ? HEADERS_NOTE
      : "Diagram library version: `" + libraryVersion + "`.\n\n" + HEADERS_NOTE;

    // built once, copied per operation so no operation shares mutable objects with another
    JsonArray optionParams = optionParameters(options, formats);
    JsonObject requestBody = diagramInput(options, formats);

    paths.put("/" + name + "/{output_format}/{source_encoded}", new JsonObject()
      .put("get", operation(name, "get" + pascal(name),
        "Convert a " + name + " diagram encoded in the URL", description, formats)
        .put("parameters", new JsonArray()
          .add(outputFormatParameter(formats))
          .add(ref("parameters/SourceEncoded"))
          .addAll(optionParams.copy()))));

    paths.put("/" + name, new JsonObject()
      .put("post", operation(name, "post" + pascal(name),
        "Convert a " + name + " diagram", description, formats)
        .put("parameters", new JsonArray()
          .add(outputFormatQueryParameter(formats))
          .addAll(optionParams.copy()))
        .put("requestBody", requestBody.copy())));

    paths.put("/" + name + "/{output_format}", new JsonObject()
      .put("post", operation(name, "post" + pascal(name) + "InFormat",
        "Convert a " + name + " diagram to the given format", description, formats)
        .put("parameters", new JsonArray()
          .add(outputFormatParameter(formats))
          .addAll(optionParams.copy()))
        .put("requestBody", requestBody.copy())));
    return true;
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

  private static JsonArray optionParameters(List<DiagramOption> options, List<FileFormat> formats) {
    JsonArray parameters = new JsonArray();
    for (DiagramOption option : options) {
      if (option.kind() == DiagramOption.Kind.PREFIX || !appliesTo(option, formats)) continue;
      // documented once, as a query parameter: the Kroki-Diagram-Options-* headers are mentioned in the
      // operation description instead of doubling the parameter list
      parameters.add(parameter(option.name(), "query", optionDescription(option, formats), optionSchema(option)));
    }
    return parameters;
  }

  private static JsonObject parameter(String name, String in, String description, JsonObject schema) {
    JsonObject parameter = new JsonObject().put("name", name).put("in", in).put("required", false);
    if (!description.isBlank()) parameter.put("description", description);
    return parameter.put("schema", schema);
  }

  private static JsonObject diagramInput(List<DiagramOption> options, List<FileFormat> formats) {
    JsonObject properties = new JsonObject();
    List<String> prefixNotes = new ArrayList<>();
    for (DiagramOption option : options) {
      if (!appliesTo(option, formats)) continue;
      String description = optionDescription(option, formats);
      if (option.kind() == DiagramOption.Kind.PREFIX) {
        prefixNotes.add("`" + option.name() + "<name>`" + (description.isBlank() ? "" : ": " + description));
      } else {
        JsonObject schema = optionSchema(option);
        if (!description.isBlank()) schema.put("description", description);
        properties.put(option.name(), schema);
      }
    }

    String optionsDescription = "Diagram-specific options. They can also be passed as query parameters "
      + "or as Kroki-Diagram-Options-* headers.";
    if (!prefixNotes.isEmpty()) {
      optionsDescription += "\n\nAny option whose name starts with one of these prefixes is also accepted:\n- "
        + String.join("\n- ", prefixNotes);
    }

    JsonObject optionsSchema = new JsonObject().put("type", "object")
      .put("description", optionsDescription)
      .put("additionalProperties", new JsonObject().put("type", "string"));
    if (!properties.isEmpty()) optionsSchema.put("properties", properties);

    JsonObject bodySchema = new JsonObject().put("type", "object")
      .put("required", new JsonArray().add("diagram_source"))
      .put("properties", new JsonObject()
        .put("diagram_source", new JsonObject().put("type", "string"))
        .put("output_format", new JsonObject().put("type", "string").put("enum", formatNames(formats)))
        .put("diagram_options", optionsSchema));
    return new JsonObject().put("required", true).put("content", new JsonObject()
      .put("text/plain", new JsonObject().put("schema", new JsonObject().put("type", "string")))
      .put("application/json", new JsonObject().put("schema", bodySchema)));
  }

  /** Type, enum and default only; the description is added where it is shown. */
  private static JsonObject optionSchema(DiagramOption option) {
    JsonObject schema = new JsonObject().put("type", "string"); // flags too: any value enables them
    if (option.kind() == DiagramOption.Kind.ENUM) schema.put("enum", new JsonArray(option.values()));
    if (option.defaultValue() != null) schema.put("default", option.defaultValue());
    return schema;
  }

  private static String optionDescription(DiagramOption option, List<FileFormat> formats) {
    StringBuilder description = new StringBuilder(option.description().strip());
    if (!option.formats().isEmpty()) {
      List<String> applicable = formats.stream()
        .filter(option.formats()::contains).map(FileFormat::getName).toList();
      if (applicable.size() < formats.size()) { // say it only when it is a restriction
        appendSentence(description, "Applies to output formats: " + String.join(", ", applicable) + ".");
      }
    }
    if (option.kind() == DiagramOption.Kind.FLAG) {
      appendSentence(description, "Enabled by its presence; the supplied value is ignored.");
    }
    return description.toString();
  }

  private static void appendSentence(StringBuilder text, String sentence) {
    if (!text.isEmpty()) text.append(' ');
    text.append(sentence);
  }

  private static JsonObject outputFormatQueryParameter(List<FileFormat> formats) {
    return new JsonObject().put("name", "output_format").put("in", "query").put("required", false)
      .put("description", "Output format. If omitted, the Accept header is used.")
      .put("schema", new JsonObject().put("type", "string").put("enum", formatNames(formats)));
  }

  private static boolean appliesTo(DiagramOption option, List<FileFormat> formats) {
    Set<FileFormat> optionFormats = option.formats();
    return optionFormats.isEmpty() || formats.stream().anyMatch(optionFormats::contains);
  }

  private static JsonArray formatNames(List<FileFormat> formats) {
    JsonArray values = new JsonArray();
    formats.forEach(format -> values.add(format.getName()));
    return values;
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
