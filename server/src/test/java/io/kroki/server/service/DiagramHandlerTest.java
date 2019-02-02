package io.kroki.server.service;

import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.error.UnsupportedFormatException;
import io.kroki.server.error.UnsupportedMimeTypeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.RoutingContext;
import org.assertj.core.util.Lists;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DiagramHandlerTest {

  @Test
  void should_reject_request_with_unsupported_format_infer_from_accept() {
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService(Lists.newArrayList(FileFormat.SVG), null));
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    mockDiagramRequest.setMethod(HttpMethod.POST);
    mockDiagramRequest.addAccept("image/png");
    mockDiagramRequest.setContentType("text/plain");
    mockDiagramRequest.setBodyAsString("Bob -> Alice : hello");
    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createPost("plantuml").handle(routingContext);
    verify(routingContext).fail(any(UnsupportedMimeTypeException.class)); // diagram handles svg only
  }

  @Test
  void should_reject_request_with_invalid_accept() {
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService(Lists.newArrayList(FileFormat.SVG), null));
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    mockDiagramRequest.setMethod(HttpMethod.POST);
    mockDiagramRequest.addAccept("text/html");
    mockDiagramRequest.setContentType("text/plain");
    mockDiagramRequest.setBodyAsString("Bob -> Alice : hello");
    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createPost("plantuml").handle(routingContext);
    verify(routingContext).fail(any(UnsupportedMimeTypeException.class)); // diagram handles svg only
  }

  @Test
  void should_reject_request_with_unsupported_format() {
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService(Lists.newArrayList(FileFormat.SVG), null));
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    mockDiagramRequest.setMethod(HttpMethod.POST);
    mockDiagramRequest.addParam("output_format", "png");
    mockDiagramRequest.setContentType("text/plain");
    mockDiagramRequest.setBodyAsString("Bob -> Alice : hello");
    mockDiagramRequest.setPath("/plantuml/png");
    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createPost("plantuml").handle(routingContext);
    verify(routingContext).fail(any(UnsupportedFormatException.class)); // diagram handles svg only
  }


  /**
   * Request:
   * <p>
   * POST /plantuml
   * Accept: image/svg+xml
   * Content-Type: text/plain
   * <p>
   * Bob -> Alice : hello
   */
  @Test
  void should_accept_get_request() {
    DiagramService mockDiagramService = mockDiagramService(Lists.newArrayList(FileFormat.SVG), new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.plantumlDecode(encoded);
      }
    });
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService);
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    mockDiagramRequest.setMethod(HttpMethod.GET);
    // /plantuml/svg/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000
    mockDiagramRequest.addParam("output_format", "svg");
    mockDiagramRequest.addParam("source_encoded", "SyfFKj2rKt3CoKnELR1Io4ZDoSa70000");
    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createGet("plantuml").handle(routingContext);
    verify(mockDiagramService).convert(routingContext, "@startuml\nBob -> Alice : hello\n@enduml", FileFormat.SVG);
  }

  /**
   * Request:
   * <p>
   * POST /plantuml
   * Accept: image/svg+xml
   * Content-Type: text/plain
   * <p>
   * Bob -> Alice : hello
   */
  @Test
  void should_accept_plain_text_request_with_accept() {
    DiagramService mockDiagramService = mockDiagramService(Lists.newArrayList(FileFormat.SVG), null);
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService);
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    mockDiagramRequest.setMethod(HttpMethod.POST);
    mockDiagramRequest.addAccept("image/svg+xml");
    mockDiagramRequest.setContentType("text/plain");
    mockDiagramRequest.setBodyAsString("Bob -> Alice : hello");
    mockDiagramRequest.setPath("/plantuml");

    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createPost("plantuml").handle(routingContext);
    verify(mockDiagramService).convert(routingContext, "Bob -> Alice : hello", FileFormat.SVG);
  }

  /**
   * Request:
   * <p>
   * POST /plantuml/svg
   * Content-Type: text/plain
   * <p>
   * Bob -> Alice : hello
   */
  @Test
  void should_accept_plain_text_request() {
    DiagramService mockDiagramService = mockDiagramService(Lists.newArrayList(FileFormat.SVG), null);
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService);
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    mockDiagramRequest.setMethod(HttpMethod.POST);
    mockDiagramRequest.addParam("output_format", "svg");
    mockDiagramRequest.setContentType("text/plain");
    mockDiagramRequest.setBodyAsString("Bob -> Alice : hello");
    mockDiagramRequest.setPath("/plantuml/svg");

    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createPost("plantuml").handle(routingContext);
    verify(mockDiagramService).convert(routingContext, "Bob -> Alice : hello", FileFormat.SVG);
  }

  /**
   * Request:
   * <p>
   * POST /plantuml
   * Accept: image/svg+xml
   * Content-Type: application/json
   * <p>
   * {"diagram_source": "Bob -> Alice : hello"}
   */
  @Test
  void should_accept_json_request_with_accept() {
    DiagramService mockDiagramService = mockDiagramService(Lists.newArrayList(FileFormat.SVG), null);
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService);
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    mockDiagramRequest.setMethod(HttpMethod.POST);
    mockDiagramRequest.addAccept("image/svg+xml");
    mockDiagramRequest.setContentType("application/json");
    mockDiagramRequest.setBodyAsString("{\"diagram_source\": \"Bob -> Alice : hello\"}");
    mockDiagramRequest.setPath("/plantuml");

    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createPost("plantuml").handle(routingContext);
    verify(mockDiagramService).convert(routingContext, "Bob -> Alice : hello", FileFormat.SVG);
  }

  /**
   * Request:
   * <p>
   * POST /plantuml/svg
   * Content-Type: application/json
   * <p>
   * {"diagram_source": "Bob -> Alice : hello", "output_format": "svg"}
   */
  @Test
  void should_accept_json_request_with_output_format_field() {
    DiagramService mockDiagramService = mockDiagramService(Lists.newArrayList(FileFormat.SVG), null);
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService);
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    mockDiagramRequest.setMethod(HttpMethod.POST);
    mockDiagramRequest.setContentType("application/json");
    mockDiagramRequest.setBodyAsString("{\"diagram_source\": \"Bob -> Alice : hello\", \"output_format\": \"svg\"}");
    mockDiagramRequest.setPath("/plantuml");

    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createPost("plantuml").handle(routingContext);
    verify(mockDiagramService).convert(routingContext, "Bob -> Alice : hello", FileFormat.SVG);
  }

  /**
   * Request:
   * <p>
   * POST /plantuml/svg
   * Content-Type: application/json
   * <p>
   * {"diagram_source": "Bob -> Alice : hello"}
   */
  @Test
  void should_accept_json_request() {
    DiagramService mockDiagramService = mockDiagramService(Lists.newArrayList(FileFormat.SVG), null);
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService);
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    mockDiagramRequest.setMethod(HttpMethod.POST);
    mockDiagramRequest.addParam("output_format", "svg");
    mockDiagramRequest.setContentType("application/json");
    mockDiagramRequest.setBodyAsString("{\"diagram_source\": \"Bob -> Alice : hello\"}");
    mockDiagramRequest.setPath("/plantuml/svg");

    // handle
    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createPost("plantuml").handle(routingContext);
    verify(mockDiagramService).convert(routingContext, "Bob -> Alice : hello", FileFormat.SVG);
  }

  private DiagramService mockDiagramService(List<FileFormat> supportedFormats, SourceDecoder sourceDecoder) {
    DiagramService diagramService = mock(DiagramService.class);
    when(diagramService.getSupportedFormats()).thenReturn(supportedFormats);
    when(diagramService.getSourceDecoder()).thenReturn(sourceDecoder);
    return diagramService;
  }
}
