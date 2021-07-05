package io.kroki.server.service;

import com.structurizr.dsl.StructurizrDslParser;
import com.structurizr.dsl.StructurizrDslParserException;
import com.structurizr.io.plantuml.StructurizrPlantUMLWriter;
import com.structurizr.view.View;
import io.kroki.server.action.Delegator;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;

import java.io.StringWriter;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
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
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        byte[] data = convert(sourceDecoded, fileFormat, this.structurizrPlantUMLWriter);
        future.complete(data);
      } catch (IllegalStateException e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }

  static byte[] convert(String source, FileFormat fileFormat, StructurizrPlantUMLWriter structurizrPlantUMLWriter) {
    StructurizrDslParser parser = new StructurizrDslParser();
    try {
      parser.parse(source);
      Collection<View> views = parser.getWorkspace().getViews().getViews();
      Optional<View> optionalView = views.stream().findFirst();
      if (optionalView.isPresent()) {
        // for now, take the first view
        View firstView = optionalView.get();
        StringWriter stringWriter = new StringWriter();
        structurizrPlantUMLWriter.write(firstView, stringWriter);
        String plantumlDiagram = stringWriter.toString();
        return Plantuml.convert(plantumlDiagram, fileFormat);
      }
      throw new BadRequestException("Empty diagram, does not have any view.");
    } catch (StructurizrDslParserException e) {
      throw new BadRequestException("Unable to parse the Structurizr DSL.", e);
    }
  }
}
