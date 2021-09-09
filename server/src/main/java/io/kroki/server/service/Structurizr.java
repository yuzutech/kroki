package io.kroki.server.service;

import com.structurizr.dsl.StructurizrDslParser;
import com.structurizr.dsl.StructurizrDslParserException;
import com.structurizr.io.plantuml.StructurizrPlantUMLWriter;
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

import java.io.StringWriter;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public class Structurizr implements DiagramService {

  private final Vertx vertx;
  private final StructurizrPlantUMLWriter structurizrPlantUMLWriter;
  private final SourceDecoder sourceDecoder;

  // same as PlantUML since we convert Structurizr DSL to PlantUML
  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG, FileFormat.BASE64, FileFormat.TXT, FileFormat.UTXT);

  public Structurizr(Vertx vertx) {
    this.vertx = vertx;
    this.structurizrPlantUMLWriter = new StructurizrPlantUMLWriter();
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
    return "1.6.3";
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        byte[] data = convert(sourceDecoded, fileFormat, this.structurizrPlantUMLWriter, options);
        future.complete(data);
      } catch (IllegalStateException e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }

  static byte[] convert(String source, FileFormat fileFormat, StructurizrPlantUMLWriter structurizrPlantUMLWriter, JsonObject options) {
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
      StringWriter stringWriter = new StringWriter();
      structurizrPlantUMLWriter.write(selectedView, stringWriter);
      String plantumlDiagram = stringWriter.toString();
      return Plantuml.convert(plantumlDiagram, fileFormat);
    } catch (StructurizrDslParserException e) {
      throw new BadRequestException("Unable to parse the Structurizr DSL.", e);
    }
  }
}
