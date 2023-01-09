package io.kroki.server.service;

import com.structurizr.dsl.StructurizrDslParser;
import com.structurizr.dsl.StructurizrDslParserException;
import com.structurizr.export.Diagram;
import com.structurizr.export.plantuml.StructurizrPlantUMLExporter;
import com.structurizr.view.Border;
import com.structurizr.view.ComponentView;
import com.structurizr.view.ContainerView;
import com.structurizr.view.DeploymentView;
import com.structurizr.view.DynamicView;
import com.structurizr.view.ElementStyle;
import com.structurizr.view.RelationshipStyle;
import com.structurizr.view.Shape;
import com.structurizr.view.SystemContextView;
import com.structurizr.view.SystemLandscapeView;
import com.structurizr.view.View;
import com.structurizr.view.ViewSet;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

public class Structurizr implements DiagramService {

  private final Vertx vertx;
  private final StructurizrPlantUMLExporter structurizrPlantUMLExporter;
  private final SourceDecoder sourceDecoder;

  // same as PlantUML since we convert Structurizr DSL to PlantUML
  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG, FileFormat.BASE64, FileFormat.TXT, FileFormat.UTXT);

  private static final String aws = read("structurizr/amazon-web-services.json");
  private static final String gcp = read("structurizr/google-cloud-platform.json");
  private static final String k8s = read("structurizr/kubernetes.json");
  private static final String azure = read("structurizr/microsoft-azure.json");
  private static final String oracleCloud = read("structurizr/oracle-cloud-infrastructure.json");

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
    return "1.22.0";
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
      ViewSet viewSet = parser.getWorkspace().getViews();
      Collection<View> views = viewSet.getViews();
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
      for (String url : viewSet.getConfiguration().getThemes()) {
        if (url.startsWith("https://static.structurizr.com/themes/")) {
          String themeContent = getThemeContent(url);
          if (themeContent != null) {
            applyTheme(viewSet, themeContent);
          }
        }
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

  private static void applyTheme(ViewSet viewSet, String themeContent) {
    Object value = Json.decodeValue(themeContent);
    if (value instanceof JsonObject) {
      List<ElementStyle> elementStyles = getElementStyles((JsonObject) value);
      for (ElementStyle elementStyle : elementStyles) {
        viewSet.getConfiguration().getStyles().add(elementStyle);
      }
      List<RelationshipStyle> relationshipStyles = getRelationshipStyle((JsonObject) value);
      for (RelationshipStyle relationshipStyle : relationshipStyles) {
        viewSet.getConfiguration().getStyles().add(relationshipStyle);
      }
    }
  }

  private static List<ElementStyle> getElementStyles(JsonObject value) {
    List<ElementStyle> result = new ArrayList<>();
    Object elementsObject = value.getValue("elements");
    if (elementsObject instanceof JsonArray) {
      for (Object elementObject : ((JsonArray) elementsObject).getList()) {
        if (elementObject instanceof Map) {
          JsonObject element = new JsonObject((Map<String, Object>) elementObject);
          ElementStyle elementStyle = new ElementStyle(
            element.getString("tag"),
            element.getInteger("width"),
            element.getInteger("height"),
            element.getString("background", "#FFFFFF"), // remind: cannot pass a null value
            element.getString("color", "#000000"), // remind: cannot pass a null value
            element.getInteger("fontSize")
          );
          elementStyle.setBorder(getBorder(element));
          elementStyle.setStroke(element.getString("stroke"));
          elementStyle.setShape(getShape(element));
          elementStyle.setIcon(element.getString("icon"));
          elementStyle.setOpacity(element.getInteger("opacity"));
          elementStyle.setMetadata(element.getBoolean("metadata"));
          elementStyle.setDescription(element.getBoolean("description"));
          result.add(elementStyle);
        }
      }
    }
    return result;
  }

  private static String getThemeContent(String url) {
    if (url.contains("amazon-web-services")) {
      return aws;
    }
    if (url.contains("google-cloud-platform")) {
      return gcp;
    }
    if (url.contains("kubernetes")) {
      return k8s;
    }
    if (url.contains("microsoft-azure")) {
      return azure;
    }
    if (url.contains("oracle-cloud-infrastructure")) {
      return oracleCloud;
    }
    return null;
  }

  private static List<RelationshipStyle> getRelationshipStyle(JsonObject value) {
    List<RelationshipStyle> result = new ArrayList<>();
    // remind: RelationshipStyle does not have a public constructor, as a result, we cannot instantiate it.
    return result;
  }

  private static String read(String resource) {
    InputStream input = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);
    try {
      if (input == null) {
        throw new IOException("Unable to get resource: " + resource);
      }
      try (BufferedReader buffer = new BufferedReader(new InputStreamReader(input))) {
        return buffer.lines().collect(Collectors.joining("\n"));
      }
    } catch (IOException e) {
      throw new RuntimeException("Unable to initialize the Structurizr service", e);
    }
  }

  private static Shape getShape(JsonObject element) {
    String shapeValue = element.getString("shape");
    if (shapeValue == null) {
      return null;
    }
    try {
      return Shape.valueOf(shapeValue);
    } catch (IllegalArgumentException e) {
      // ignore!
      return null;
    }
  }

  private static Border getBorder(JsonObject element) {
    String borderValue = element.getString("border");
    if (borderValue == null) {
      return null;
    }
    try {
      return Border.valueOf(borderValue);
    } catch (IllegalArgumentException e) {
      // ignore!
      return null;
    }
  }
}
