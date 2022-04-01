package io.kroki.server.service;

import com.structurizr.dsl.StructurizrDslParser;
import com.structurizr.dsl.StructurizrDslParserException;
import com.structurizr.export.Diagram;
import com.structurizr.export.plantuml.StructurizrPlantUMLExporter;
import com.structurizr.view.ComponentView;
import com.structurizr.view.ContainerView;
import com.structurizr.view.DeploymentView;
import com.structurizr.view.DynamicView;
import com.structurizr.view.SystemContextView;
import com.structurizr.view.SystemLandscapeView;
import com.structurizr.view.View;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public class Structurizr implements DiagramService {

  private final Vertx vertx;
  private final StructurizrPlantUMLExporter structurizrPlantUMLExporter;
  private final SourceDecoder sourceDecoder;

  // same as PlantUML since we convert Structurizr DSL to PlantUML
  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG, FileFormat.BASE64, FileFormat.TXT, FileFormat.UTXT);

  public Structurizr(Vertx vertx) {
    this.vertx = vertx;
    this.structurizrPlantUMLExporter = new StructurizrPlantUMLExporter();
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
  }

  @Override
  public List<FileFormat> getSupportedFormats() {
    return SUPPORTED_FORMATS;
  }

  @Override
  public SourceDecoder getSourceDecoder() {
    return sourceDecoder;
  }

  @Override
  public String getVersion() {
    return "1.19.1";
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        byte[] data = convert(sourceDecoded, fileFormat, this.structurizrPlantUMLExporter, options);
        future.complete(data);
      } catch (IllegalStateException e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }

  static byte[] convert(String source, FileFormat fileFormat, StructurizrPlantUMLExporter structurizrPlantUMLExporter, JsonObject options) {
    StructurizrDslParser parser = new StructurizrDslParser();
    try {
      parser.parse(source);
      Collection<View> views = parser.getWorkspace().getViews().getViews();
      if (views.isEmpty()) {
        throw new BadRequestException("Empty diagram, does not have any view.");
      }
      View selectedView;
      String viewKey = options.getString("view-key");
      if (viewKey != null && !viewKey.trim().isEmpty()) {
        Optional<View> viewFound = views.stream().filter(view -> Objects.equals(view.getKey(), viewKey)).findFirst();
        if (!viewFound.isPresent()) {
          throw new BadRequestException("Unable to find view for key: " + viewKey + ".");
        }
        selectedView = viewFound.get();
      } else {
        // take the first view if not specified
        selectedView = views.iterator().next();
      }
      final Diagram diagram;
      if (selectedView instanceof DynamicView) {
        diagram = structurizrPlantUMLExporter.export((DynamicView) selectedView);
      } else if (selectedView instanceof DeploymentView) {
        diagram = structurizrPlantUMLExporter.export((DeploymentView) selectedView);
      } else if (selectedView instanceof ComponentView) {
        diagram = structurizrPlantUMLExporter.export((ComponentView) selectedView);
      } else if (selectedView instanceof ContainerView) {
        diagram = structurizrPlantUMLExporter.export((ContainerView) selectedView);
      } else if (selectedView instanceof SystemContextView) {
        diagram = structurizrPlantUMLExporter.export((SystemContextView) selectedView);
      } else if (selectedView instanceof SystemLandscapeView) {
        diagram = structurizrPlantUMLExporter.export((SystemLandscapeView) selectedView);
      } else {
        throw new BadRequestException("View type is not supported: " + selectedView.getClass().getSimpleName() + ", must be a DynamicView, DeploymentView, ComponentView, ContainerView, SystemContextView or SystemLandscapeView.");
      }
      return Plantuml.convert(diagram.getDefinition(), fileFormat, new JsonObject());
    } catch (StructurizrDslParserException e) {
      String cause = e.getMessage();
      final String message;
      if (cause != null && !cause.trim().isEmpty()) {
        message = "Unable to parse the Structurizr DSL. " + cause + ".";
      } else {
        message = "Unable to parse the Structurizr DSL.";
      }
      throw new BadRequestException(message, e);
    }
  }
}
