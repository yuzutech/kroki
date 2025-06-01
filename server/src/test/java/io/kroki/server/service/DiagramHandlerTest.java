package io.kroki.server.service;

import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.error.UnsupportedFormatException;
import io.kroki.server.error.UnsupportedMimeTypeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Future;
import io.vertx.core.MultiMap;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import org.assertj.core.util.Lists;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
    verify(mockDiagramService).convert(eq("@startuml\nBob -> Alice : hello\n@enduml"), eq("plantuml"), eq(FileFormat.SVG), any());
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
    verify(mockDiagramService).convert(eq("Bob -> Alice : hello"), eq("plantuml"), eq(FileFormat.SVG), any());
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
    verify(mockDiagramService).convert(eq("Bob -> Alice : hello"), eq("plantuml"), eq(FileFormat.SVG), any());
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
    verify(mockDiagramService).convert(eq("Bob -> Alice : hello"), eq("plantuml"), eq(FileFormat.SVG), any());
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
    verify(mockDiagramService).convert(eq("Bob -> Alice : hello"), eq("plantuml"), eq(FileFormat.SVG), any());
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
    verify(mockDiagramService).convert(eq("Bob -> Alice : hello"), eq("plantuml"), eq(FileFormat.SVG), any());
  }

  @Test
  void should_extract_options_as_query_params_from_get_request() {
    DiagramService mockDiagramService = mockDiagramService(Lists.newArrayList(FileFormat.SVG), new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    });
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService);
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    MultiMap params = MultiMap.caseInsensitiveMultiMap();
    // /graphviz/svg/eNpLyUwvSizIUKhWSFTQtVNIUqgFADrsBaY=
    params.add("output_format", "svg");
    params.add("source_encoded", "eNpLyUwvSizIUKhWSFTQtVNIUqgFADrsBaY=");
    params.add("node-attribute-fontcolor", "Crimson");
    params.add("node-attribute-shape", "rect");
    params.add("layout", "neato");
    params.add("graph-attribute-fontcolor", "SteelBlue");
    params.add("graph-attribute-label", "Hello World");
    params.add("edge-attribute-color", "NavajoWhite");
    params.add("edge-attribute-arrowhead", "diamond");
    mockDiagramRequest.setParams(params);
    mockDiagramRequest.setHeaders(MultiMap.caseInsensitiveMultiMap());
    mockDiagramRequest.setMethod(HttpMethod.GET);
    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createGet("graphviz").handle(routingContext);
    JsonObject options = new JsonObject();
    options.put("layout", "neato");
    options.put("edge-attribute-arrowhead", "diamond");
    options.put("graph-attribute-fontcolor", "SteelBlue");
    options.put("node-attribute-fontcolor", "Crimson");
    options.put("edge-attribute-color", "NavajoWhite");
    options.put("node-attribute-shape", "rect");
    options.put("graph-attribute-label", "Hello World");
    verify(mockDiagramService).convert(eq("digraph { a -> b }"), eq("graphviz"), eq(FileFormat.SVG), eq(options));
  }

  @Test
  void should_extract_options_as_headers_from_get_request() {
    DiagramService mockDiagramService = mockDiagramService(Lists.newArrayList(FileFormat.SVG), new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    });
    DiagramHandler diagramHandler = new DiagramHandler(mockDiagramService);
    MockDiagramRequest mockDiagramRequest = new MockDiagramRequest();
    MultiMap params = MultiMap.caseInsensitiveMultiMap();
    // /graphviz/svg/eNpLyUwvSizIUKhWSFTQtVNIUqgFADrsBaY=
    params.add("output_format", "svg");
    params.add("source_encoded", "eNpLyUwvSizIUKhWSFTQtVNIUqgFADrsBaY=");
    mockDiagramRequest.setParams(params);
    MultiMap headers = MultiMap.caseInsensitiveMultiMap();
    headers.add("kroki-diagram-options-node-attribute-fontcolor", "Crimson");
    headers.add("KROKI-DIAGRAM-OPTIONS-NODE-ATTRIBUTE-SHAPE", "rect");
    headers.add("KROKI-DIAGRAM-OPTIONS-layout", "neato");
    headers.add("KROKI-DIAGRAM-OPTIONS-GRAPH-ATTRIBUTE-FONTCOLOR", "SteelBlue");
    headers.add("kroki-diagram-options-graph-attribute-label", "Hello World");
    headers.add("kroki-diagram-options-EDGE-ATTRIBUTE-COLOR", "NavajoWhite");
    headers.add("Kroki-Diagram-Options-Edge-Attribute-ArrowHead", "diamond");
    mockDiagramRequest.setHeaders(headers);
    mockDiagramRequest.setMethod(HttpMethod.GET);
    RoutingContext routingContext = mockDiagramRequest.getRoutingContext();
    diagramHandler.createGet("graphviz").handle(routingContext);
    JsonObject options = new JsonObject();
    options.put("layout", "neato");
    options.put("edge-attribute-arrowhead", "diamond");
    options.put("graph-attribute-fontcolor", "SteelBlue");
    options.put("node-attribute-fontcolor", "Crimson");
    options.put("edge-attribute-color", "NavajoWhite");
    options.put("node-attribute-shape", "rect");
    options.put("graph-attribute-label", "Hello World");
    verify(mockDiagramService).convert(eq("digraph { a -> b }"), eq("graphviz"), eq(FileFormat.SVG), eq(options));
  }

  @Test
  void should_extract_options_using_precedence_order_json_body() {
    JsonObject diagramOptions = new JsonObject();
    diagramOptions.put("node-attribute-fontcolor", "DarkSalmon");
    MultiMap headers = MultiMap.caseInsensitiveMultiMap();
    headers.add("kroki-diagram-options-node-attribute-fontcolor", "LightSalmon");
    MultiMap params = MultiMap.caseInsensitiveMultiMap();
    params.add("node-attribute-fontcolor", "Crimson");
    JsonObject actual = DiagramHandler.getOptions(diagramOptions, headers, params);
    // JSON body has higher precedence over both HTTP headers and query parameters
    HashMap<String, Object> expected = new HashMap<>();
    expected.put("node-attribute-fontcolor", "DarkSalmon");
    assertThat(actual.getMap()).isEqualTo(expected);
  }

  @Test
  void should_extract_options_using_precedence_order_http_header() {
    JsonObject diagramOptions = new JsonObject();
    MultiMap headers = MultiMap.caseInsensitiveMultiMap();
    headers.add("kroki-diagram-options-node-attribute-fontcolor", "LightSalmon");
    MultiMap params = MultiMap.caseInsensitiveMultiMap();
    params.add("node-attribute-fontcolor", "Crimson");
    JsonObject actual = DiagramHandler.getOptions(diagramOptions, headers, params);
    // HTTP headers have higher precedence over query parameters
    HashMap<String, Object> expected = new HashMap<>();
    expected.put("node-attribute-fontcolor", "LightSalmon");
    assertThat(actual.getMap()).isEqualTo(expected);
  }

  private DiagramService mockDiagramService(List<FileFormat> supportedFormats, SourceDecoder sourceDecoder) {
    DiagramService diagramService = mock(DiagramService.class);
    when(diagramService.getSupportedFormats()).thenReturn(supportedFormats);
    when(diagramService.getSourceDecoder()).thenReturn(sourceDecoder);
    when(diagramService.convert(any(), any(), any(), any())).thenReturn(Future.succeededFuture(Buffer.buffer("")));
    return diagramService;
  }
}
