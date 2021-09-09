package io.kroki.server.service;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.error.UndefinedOutputFormatException;
import io.kroki.server.error.UnsupportedFormatException;
import io.kroki.server.error.UnsupportedMimeTypeException;
import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.kroki.server.log.Logging;
import io.kroki.server.response.Caching;
import io.kroki.server.response.DiagramResponse;
import io.vertx.core.Handler;
import io.vertx.core.MultiMap;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.MIMEHeader;
import io.vertx.ext.web.ParsedHeaderValue;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class DiagramHandler {

  private static final Logger logger = LoggerFactory.getLogger(DiagramHandler.class);
  private final DiagramService service;
  private final Logging logging;
  private final DiagramResponse diagramResponse;

  public DiagramHandler(DiagramService service) {
    this(service, null);
  }

  public DiagramHandler(DiagramService service, Caching caching) {
    this.service = service;
    this.logging = new Logging(logger);
    this.diagramResponse = new DiagramResponse(caching);
  }

  public Handler<RoutingContext> createRequestReceived(String serviceName) {
    return routingContext -> {
      logging.requestReceived(routingContext, serviceName);
      routingContext.next();
    };
  }

  public Handler<RoutingContext> createGet(String serviceName) {
    return routingContext -> {
      HttpServerRequest request = routingContext.request();
      String outputFormat = request.getParam("output_format");
      FileFormat fileFormat;
      try {
        fileFormat = validate(serviceName, outputFormat);
      } catch (UnsupportedFormatException e) {
        routingContext.fail(e);
        return;
      }
      String sourceEncoded = request.getParam("source_encoded");
      try {
        String sourceDecoded = service.getSourceDecoder().decode(sourceEncoded);
        MultiMap headers = request.headers();
        MultiMap params = request.params();
        JsonObject options = getOptions(new JsonObject(), headers, params);
        convert(routingContext, sourceDecoded, serviceName, fileFormat, options);
      } catch (DecodeException e) {
        routingContext.fail(new BadRequestException(e.getMessage(), e));
      }
    };
  }

  public Handler<RoutingContext> createPost(String serviceName) {
    return routingContext -> {
      try {
        FileFormat fileFormat;
        String diagramSource;
        JsonObject jsonBody;
        MIMEHeader contentType = routingContext.parsedHeaders().contentType();
        if (contentType != null && contentType.value() != null && contentType.value().equals("application/json")) {
          String bodyAsString = routingContext.getBodyAsString();
          if (bodyAsString == null || bodyAsString.trim().isEmpty()) {
            routingContext.fail(new BadRequestException("Request body must not be empty."));
            return;
          }
          jsonBody = new JsonObject(bodyAsString);
          diagramSource = jsonBody.getString("diagram_source");
          if (diagramSource == null || diagramSource.trim().isEmpty()) {
            routingContext.fail(new BadRequestException("Field diagram_source must not be empty."));
            return;
          }
          fileFormat = getOutputFileFormatFromJsonRequest(serviceName, routingContext, jsonBody);
        } else {
          // assumes that the Content-Type is "plain/text" (default)
          jsonBody = new JsonObject();
          diagramSource = routingContext.getBodyAsString();
          if (diagramSource == null || diagramSource.trim().isEmpty()) {
            routingContext.fail(new BadRequestException("Request body must not be empty."));
            return;
          }
          fileFormat = getOutputFileFormatFromTextRequest(serviceName, routingContext);
        }
        HttpServerRequest request = routingContext.request();
        MultiMap headers = request.headers();
        MultiMap params = request.params();
        JsonObject diagramOptions = jsonBody.getJsonObject("diagram_options", new JsonObject());
        JsonObject options = getOptions(diagramOptions, headers, params);
        convert(routingContext, diagramSource, serviceName, fileFormat, options);
      } catch (UnsupportedFormatException | UnsupportedMimeTypeException | UndefinedOutputFormatException e) {
        routingContext.fail(e);
      }
    };
  }

  private FileFormat getOutputFileFormatFromTextRequest(String serviceName, RoutingContext routingContext) {
    String outputFormat = routingContext.request().getParam("output_format");
    if (outputFormat != null) {
      return validate(serviceName, outputFormat);
    }
    return getOutputFileFormatFromAcceptHeaders(serviceName, routingContext);
  }

  private FileFormat getOutputFileFormatFromJsonRequest(String serviceName, RoutingContext routingContext, JsonObject jsonBody) {
    String outputFormat = routingContext.request().getParam("output_format");
    if (outputFormat != null) {
      return validate(serviceName, outputFormat);
    }
    outputFormat = jsonBody.getString("output_format");
    if (outputFormat != null) {
      return validate(serviceName, outputFormat);
    }
    return getOutputFileFormatFromAcceptHeaders(serviceName, routingContext);
  }

  private FileFormat getOutputFileFormatFromAcceptHeaders(String serviceName, RoutingContext routingContext) {
    List<String> mimeTypes = routingContext.parsedHeaders()
      .accept()
      .stream()
      .sorted(Comparator.comparingInt(ParsedHeaderValue::weightedOrder))
      .map(ParsedHeaderValue::value)
      .collect(Collectors.toList());
    List<FileFormat> supportedFormats = service.getSupportedFormats();
    if (mimeTypes.isEmpty()) {
      throw new UndefinedOutputFormatException(serviceName, supportedFormats);
    }
    for (String mimeType : mimeTypes) {
      FileFormat fileFormat = ContentType.get(mimeType);
      if (fileFormat != null && supportedFormats.contains(fileFormat)) {
        return fileFormat;
      }
    }
    throw new UnsupportedMimeTypeException(mimeTypes, serviceName, supportedFormats);
  }

  static JsonObject getOptions(JsonObject diagramOptions, MultiMap headers, MultiMap params) {
    Map<String, Object> options = new HashMap<>();
    for (Map.Entry<String, String> paramEntry : params.entries()) {
      if (paramEntry.getKey().equalsIgnoreCase("source_encoded") || paramEntry.getKey().equalsIgnoreCase("output_format")) {
        continue;
      }
      options.put(paramEntry.getKey().toLowerCase(), paramEntry.getValue());
    }
    for (Map.Entry<String, String> headerEntry : headers.entries()) {
      if (headerEntry.getKey().toLowerCase().startsWith("kroki-diagram-options-")) {
        String key = headerEntry.getKey().toLowerCase().replace("kroki-diagram-options-", "");
        options.put(key, headerEntry.getValue());
      }
    }
    for (String diagramOptionName : diagramOptions.fieldNames()) {
      Object value = diagramOptions.getValue(diagramOptionName);
      options.put(diagramOptionName.toLowerCase(), value);
    }
    return new JsonObject(options);
  }

  // delegate

  public FileFormat validate(String serviceName, String outputFormat) {
    FileFormat fileFormat = FileFormat.get(outputFormat);
    List<FileFormat> supportedFormats = service.getSupportedFormats();
    if (fileFormat == null || !supportedFormats.contains(fileFormat)) {
      throw new UnsupportedFormatException(outputFormat, serviceName, supportedFormats);
    }
    return fileFormat;
  }

  public void convert(RoutingContext routingContext, String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    long start = System.currentTimeMillis();
    service.convert(sourceDecoded, serviceName, fileFormat, options, res -> {
      logging.convert(routingContext, start, serviceName, fileFormat);
      if (res.failed()) {
        routingContext.fail(res.cause());
      } else {
        HttpServerResponse response = routingContext.response();
        if (!response.closed()) {
          diagramResponse.end(response, sourceDecoded, fileFormat, res.result());
        }
      }
    });
  }
}
