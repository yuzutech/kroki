package io.kroki.server.service;

import com.structurizr.dsl.StructurizrDslParser;
import com.structurizr.dsl.StructurizrDslParserException;
import com.structurizr.export.Diagram;
import com.structurizr.export.plantuml.StructurizrPlantUMLExporter;
import com.structurizr.view.*;
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
import java.util.*;
import java.util.stream.Collectors;

public class Structurizr implements DiagramService {

  private final Vertx vertx;
  private final StructurizrPlantUMLExporter structurizrPlantUMLExporter;
  private final SourceDecoder sourceDecoder;
  private final PlantumlCommand plantumlCommand;

  // same as PlantUML since we convert Structurizr DSL to PlantUML
  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.PDF, FileFormat.BASE64, FileFormat.TXT, FileFormat.UTXT);

  private static final StructurizrTheme defaultTheme = readTheme("structurizr/default.json");
  private static final StructurizrTheme awsTheme2020 = readTheme("structurizr/amazon-web-services-2020.04.30.json");
  private static final StructurizrTheme awsTheme2022 = readTheme("structurizr/amazon-web-services-2022.04.30.json");
  private static final StructurizrTheme awsTheme2023 = readTheme("structurizr/amazon-web-services-2023.01.31.json");
  private static final StructurizrTheme gcpTheme = readTheme("structurizr/google-cloud-platform.json");
  private static final StructurizrTheme k8sTheme = readTheme("structurizr/kubernetes.json");
  private static final StructurizrTheme azureTheme2021 = readTheme("structurizr/microsoft-azure-2021.01.26.json");
  private static final StructurizrTheme azureTheme2023 = readTheme("structurizr/microsoft-azure-2023.01.24.json");
  private static final StructurizrTheme oracleCloudTheme2021 = readTheme("structurizr/oracle-cloud-infrastructure-2021.04.30.json");
  private static final StructurizrTheme oracleCloudTheme2023 = readTheme("structurizr/oracle-cloud-infrastructure-2023.04.01.json");

  public Structurizr(Vertx vertx, JsonObject config) {
    this.vertx = vertx;
    this.structurizrPlantUMLExporter = new StructurizrPlantUMLExporter();
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
    this.plantumlCommand = new PlantumlCommand(config);
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
    return "1.32.0";
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        byte[] data = convert(sourceDecoded, fileFormat, options);
        future.complete(data);
      } catch (Exception e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }

  static byte[] convert(String source, FileFormat fileFormat, PlantumlCommand plantumlCommand, StructurizrPlantUMLExporter structurizrPlantUMLExporter, JsonObject options) throws IOException, InterruptedException {
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
        if (viewFound.isEmpty()) {
          throw new BadRequestException("Unable to find view for key: " + viewKey + ".");
        }
        selectedView = viewFound.get();
      } else {
        // take the first view if not specified
        selectedView = views.iterator().next();
      }
      for (String url : viewSet.getConfiguration().getThemes()) {
        if (url.startsWith("https://static.structurizr.com/themes/")) {
          StructurizrTheme theme = getThemeContent(url);
          if (theme != null) {
            applyTheme(viewSet, theme);
          }
        } else if (url.equalsIgnoreCase("default")) {
          applyTheme(viewSet, defaultTheme);
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
      return plantumlCommand.convert(diagram.getDefinition(), fileFormat, new JsonObject());
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

  private byte[] convert(String source, FileFormat fileFormat, JsonObject options) throws IOException, InterruptedException {
    return convert(source, fileFormat, this.plantumlCommand, this.structurizrPlantUMLExporter, options);
  }

  private static void applyTheme(ViewSet viewSet, StructurizrTheme theme) {
    List<ElementStyle> elementStyles = theme.getElementStyles();
    for (ElementStyle elementStyle : elementStyles) {
      String tag = elementStyle.getTag();
      ElementStyle currentElementStyle = viewSet.getConfiguration().getStyles().getElementStyle(tag);
      if (currentElementStyle == null) {
        viewSet.getConfiguration().getStyles().add(elementStyle);
      }
    }
    List<RelationshipStyle> relationshipStyles = theme.getRelationshipStyle();
    for (RelationshipStyle relationshipStyle : relationshipStyles) {
      String tag = relationshipStyle.getTag();
      ElementStyle currentRelationshipStyle = viewSet.getConfiguration().getStyles().getElementStyle(tag);
      if (currentRelationshipStyle == null) {
        viewSet.getConfiguration().getStyles().add(relationshipStyle);
      }
    }
  }

  private static StructurizrTheme getThemeContent(String url) {
    if (url.contains("default")) {
      return defaultTheme;
    }
    if (url.contains("amazon-web-services-2020.04.30")) {
      return awsTheme2020;
    }
    if (url.contains("amazon-web-services-2022.04.30")) {
      return awsTheme2022;
    }
    if (url.contains("amazon-web-services")) {
      // default, latest version 2023.01.30
      return awsTheme2023;
    }
    if (url.contains("google-cloud-platform")) {
      return gcpTheme;
    }
    if (url.contains("kubernetes")) {
      return k8sTheme;
    }
    if (url.contains("microsoft-azure-2021.01.26")) {
      return azureTheme2021;
    }
    if (url.contains("microsoft-azure")) {
      // default, latest version 2023.01.24
      return azureTheme2023;
    }
    if (url.contains("oracle-cloud-infrastructure-2021.04.30")) {
      return oracleCloudTheme2021;
    }
    if (url.contains("oracle-cloud-infrastructure")) {
      // default, latest version 2023.04.01
      return oracleCloudTheme2023;
    }
    return null;
  }

  private static StructurizrTheme readTheme(String resource) {
    InputStream input = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);
    try {
      if (input == null) {
        throw new IOException("Unable to get resource: " + resource);
      }
      try (BufferedReader buffer = new BufferedReader(new InputStreamReader(input))) {
        String content = buffer.lines().collect(Collectors.joining("\n"));
        try {
          JsonObject object = (JsonObject) Json.decodeValue(content);
          return new StructurizrTheme(object);
        } catch (io.vertx.core.json.DecodeException e) {
          throw new RuntimeException("Unable to initialize the Structurizr service", e);
        }
      }
    } catch (IOException e) {
      throw new RuntimeException("Unable to initialize the Structurizr service", e);
    }
  }
}

class StructurizrTheme {

  private final List<ElementStyle> elementStyles;

  public StructurizrTheme(JsonObject object) {
    this.elementStyles = new ArrayList<>();
    Object elementsObject = object.getValue("elements");
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
          elementStyle.setStroke(element.getString("stroke", "#000000")); // remind: cannot pass a null value
          elementStyle.setShape(getShape(element));
          elementStyle.setIcon(element.getString("icon"));
          elementStyle.setOpacity(element.getInteger("opacity"));
          elementStyle.setMetadata(element.getBoolean("metadata"));
          elementStyle.setDescription(element.getBoolean("description"));
          this.elementStyles.add(elementStyle);
        }
      }
    }
  }

  public List<ElementStyle> getElementStyles() {
    return elementStyles;
  }

  public List<RelationshipStyle> getRelationshipStyle() {
    List<RelationshipStyle> result = new ArrayList<>();
    // remind: RelationshipStyle does not have a public constructor, as a result, we cannot instantiate it.
    return result;
  }

  private Shape getShape(JsonObject element) {
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

  private Border getBorder(JsonObject element) {
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
