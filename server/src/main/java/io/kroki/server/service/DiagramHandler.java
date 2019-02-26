package io.kroki.server.service;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.error.UndefinedOutputFormatException;
import io.kroki.server.error.UnsupportedFormatException;
import io.kroki.server.error.UnsupportedMimeTypeException;
import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.kroki.server.log.Logging;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.MIMEHeader;
import io.vertx.ext.web.ParsedHeaderValue;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class DiagramHandler {

  private static final Logger logger = LoggerFactory.getLogger(DiagramHandler.class);
  private final DiagramService service;
  private final Logging logging;

  public DiagramHandler(DiagramService service) {
    this.service = service;
    this.logging = new Logging(logger);
  }

  public Handler<RoutingContext> createRequestReceived() {
    return logging::requestReceived;
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
        convert(routingContext, sourceDecoded, serviceName, fileFormat);
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
        MIMEHeader contentType = routingContext.parsedHeaders().contentType();
        if (contentType != null && contentType.value() != null && contentType.value().equals("application/json")) {
          String bodyAsString = routingContext.getBodyAsString();
          if (bodyAsString == null || bodyAsString.trim().isEmpty()) {
            routingContext.fail(new BadRequestException("Request body must not be empty."));
            return;
          }
          JsonObject jsonBody = new JsonObject(bodyAsString);
          diagramSource = jsonBody.getString("diagram_source");
          if (diagramSource == null || diagramSource.trim().isEmpty()) {
            routingContext.fail(new BadRequestException("Field diagram_source must not be empty."));
            return;
          }
          fileFormat = getOutputFileFormatFromJsonRequest(serviceName, routingContext, jsonBody);
        } else {
          // assumes that the Content-Type is "plain/text" (default)
          diagramSource = routingContext.getBodyAsString();
          if (diagramSource == null || diagramSource.trim().isEmpty()) {
            routingContext.fail(new BadRequestException("Request body must not be empty."));
            return;
          }
          fileFormat = getOutputFileFormatFromTextRequest(serviceName, routingContext);
        }
        convert(routingContext, diagramSource, serviceName, fileFormat);
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

  // delegate

  public FileFormat validate(String serviceName, String outputFormat) {
    FileFormat fileFormat = FileFormat.get(outputFormat);
    List<FileFormat> supportedFormats = service.getSupportedFormats();
    if (fileFormat == null || !supportedFormats.contains(fileFormat)) {
      throw new UnsupportedFormatException(outputFormat, serviceName, supportedFormats);
    }
    return fileFormat;
  }

  public void convert(RoutingContext routingContext, String sourceDecoded, String serviceName, FileFormat fileFormat) {
    long start = System.currentTimeMillis();
    try {
      service.convert(routingContext, sourceDecoded, serviceName, fileFormat);
    } finally {
     logging.convert(routingContext, start, serviceName, fileFormat);
    }
  }
}
