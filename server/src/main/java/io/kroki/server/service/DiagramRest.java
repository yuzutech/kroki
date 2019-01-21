package io.kroki.server.service;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.UnsupportedDiagramTypeException;
import io.kroki.server.error.UnsupportedFormatException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class DiagramRest {

  private final DiagramRegistry registry;

  public DiagramRest(DiagramRegistry registry) {
    this.registry = registry;
  }

  public Handler<RoutingContext> create() {
    return routingContext -> {
      String bodyAsString = routingContext.getBodyAsString();
      if (bodyAsString == null || bodyAsString.trim().isEmpty()) {
        routingContext.fail(new BadRequestException("Request body must not be empty."));
        return;
      }
      JsonObject body = new JsonObject(bodyAsString);
      String diagramSource = body.getString("diagram_source");
      if (diagramSource == null || diagramSource.trim().isEmpty()) {
        routingContext.fail(new BadRequestException("Field diagram_source must not be empty."));
        return;
      }
      String diagramType = body.getString("diagram_type");
      if (diagramType == null || diagramType.trim().isEmpty()) {
        routingContext.fail(new BadRequestException("Field diagram_type must not be empty."));
        return;
      }
      String outputFormat = body.getString("output_format");
      if (outputFormat == null || outputFormat.trim().isEmpty()) {
        routingContext.fail(new BadRequestException("Field output_format must not be empty."));
        return;
      }
      DiagramHandler diagramHandler = registry.get(diagramType);
      if (diagramHandler == null) {
        routingContext.fail(new UnsupportedDiagramTypeException(diagramType, registry.names()));
        return;
      }
      try {
        FileFormat fileFormat = diagramHandler.validate(diagramType, outputFormat);
        diagramHandler.convert(routingContext, diagramSource, fileFormat);
      } catch (UnsupportedFormatException e) {
        routingContext.fail(e);
      }
    };
  }
}
