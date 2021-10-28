package io.kroki.server.error;

import io.vertx.core.MultiMap;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.http.impl.headers.HeadersMultiMap;
import io.vertx.ext.web.RoutingContext;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatcher;
import org.mockito.Mockito;

import java.sql.Array;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ErrorHandlerTest {

  @Test
  void should_return_internal_server_error_json() {
    Vertx vertx = Vertx.vertx();
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerResponse httpServerResponse = jsonServerResponse();
    HttpServerRequest httpServerRequest = mockHttpServerRequest();

    when(httpServerResponse.getStatusMessage()).thenReturn(null);
    when(routingContext.response()).thenReturn(httpServerResponse);
    when(routingContext.request()).thenReturn(httpServerRequest);
    when(httpServerRequest.method()).thenReturn(HttpMethod.GET);
    ErrorHandler errorHandler = new ErrorHandler(vertx, false);

    errorHandler.handle(routingContext);

    Mockito.verify(httpServerResponse).setStatusMessage("Internal Server Error");
    Mockito.verify(httpServerResponse).setStatusCode(500);
    Mockito.verify(httpServerResponse).end("{\"error\":{\"code\":500,\"message\":\"Internal Server Error\"}}");
  }

  @Test
  void should_return_unsupported_format_error_json() {
    Vertx vertx = Vertx.vertx();
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerResponse httpServerResponse = jsonServerResponse();
    HttpServerRequest httpServerRequest = mockHttpServerRequest();

    when(httpServerResponse.getStatusMessage()).thenReturn(null);
    when(routingContext.response()).thenReturn(httpServerResponse);
    when(routingContext.request()).thenReturn(httpServerRequest);
    Set<String> supportedDiagrams = new HashSet<>();
    supportedDiagrams.add("svg");
    when(routingContext.failure()).thenReturn(new UnsupportedDiagramTypeException("png", supportedDiagrams));
    when(httpServerRequest.method()).thenReturn(HttpMethod.GET);
    ErrorHandler errorHandler = new ErrorHandler(vertx, false);

    errorHandler.handle(routingContext);

    Mockito.verify(httpServerResponse).setStatusMessage("Bad Request");
    Mockito.verify(httpServerResponse).setStatusCode(400);
    Mockito.verify(httpServerResponse).end("{\"error\":{\"code\":400,\"message\":\"Unsupported diagram type: png. Must be one of svg\"}}");
  }

  @Test
  void should_return_internal_server_error_json_with_default_status_code() {
    Vertx vertx = Vertx.vertx();
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerResponse httpServerResponse = jsonServerResponse();
    HttpServerRequest httpServerRequest = mockHttpServerRequest();

    when(httpServerResponse.getStatusMessage()).thenReturn(null);
    when(routingContext.statusCode()).thenReturn(-1);
    when(routingContext.response()).thenReturn(httpServerResponse);
    when(routingContext.request()).thenReturn(httpServerRequest);
    when(httpServerRequest.method()).thenReturn(HttpMethod.GET);
    ErrorHandler errorHandler = new ErrorHandler(vertx, false);

    errorHandler.handle(routingContext);

    Mockito.verify(httpServerResponse).setStatusMessage("Internal Server Error");
    Mockito.verify(httpServerResponse).setStatusCode(500);
    Mockito.verify(httpServerResponse).end("{\"error\":{\"code\":500,\"message\":\"Internal Server Error\"}}");
  }

  @Test
  void should_return_service_unavailable_error_json() {
    Vertx vertx = Vertx.vertx();
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerResponse httpServerResponse = jsonServerResponse();
    HttpServerRequest httpServerRequest = mockHttpServerRequest();

    when(httpServerResponse.getStatusMessage()).thenReturn(null);
    when(routingContext.statusCode()).thenReturn(-1);
    when(routingContext.response()).thenReturn(httpServerResponse);
    when(routingContext.request()).thenReturn(httpServerRequest);
    when(routingContext.failure()).thenReturn(new ServiceUnavailableException("Mermaid service is unavailable!"));
    when(httpServerRequest.method()).thenReturn(HttpMethod.GET);
    ErrorHandler errorHandler = new ErrorHandler(vertx, false);

    errorHandler.handle(routingContext);

    Mockito.verify(httpServerResponse).setStatusMessage("Service Unavailable");
    Mockito.verify(httpServerResponse).setStatusCode(503);
    Mockito.verify(httpServerResponse).end("{\"error\":{\"code\":503,\"message\":\"Mermaid service is unavailable!\"}}");
  }

  @Test
  void should_return_svg_error_image() {
    Vertx vertx = Vertx.vertx();
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerResponse httpServerResponse = plainResponse();
    HttpServerRequest httpServerRequest = mock(HttpServerRequest.class);

    when(httpServerResponse.getStatusMessage()).thenReturn(null);
    when(httpServerRequest.getHeader(HttpHeaders.ACCEPT)).thenReturn("image/svg+xml");
    when(routingContext.response()).thenReturn(httpServerResponse);
    when(routingContext.request()).thenReturn(httpServerRequest);
    when(routingContext.failure()).thenReturn(new BadRequestException("Syntax Error? (line: 1)"));
    when(httpServerRequest.method()).thenReturn(HttpMethod.GET);
    ErrorHandler errorHandler = new ErrorHandler(vertx, false);

    errorHandler.handle(routingContext);

    Mockito.verify(httpServerResponse).setStatusMessage("Bad Request");
    Mockito.verify(httpServerResponse).setStatusCode(400);
    Mockito.verify(httpServerResponse).end(argThat((ArgumentMatcher<String>) argument ->
      argument.contains("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n") &&
        argument.contains("<tspan x=\"10\" dy=\"16\">Error 400: Syntax Error? (line: 1)</tspan>\n")
    ));
  }

  @Test
  void should_return_svg_error_image_when_accept_contains_image_svg_xml() {
    Vertx vertx = Vertx.vertx();
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerResponse httpServerResponse = plainResponse();
    HttpServerRequest httpServerRequest = mock(HttpServerRequest.class);

    when(httpServerResponse.getStatusMessage()).thenReturn(null);
    when(httpServerRequest.getHeader(HttpHeaders.ACCEPT)).thenReturn("image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8");
    when(routingContext.response()).thenReturn(httpServerResponse);
    when(routingContext.request()).thenReturn(httpServerRequest);
    when(routingContext.failure()).thenReturn(new BadRequestException("Syntax Error? (line: 1)"));
    when(httpServerRequest.method()).thenReturn(HttpMethod.GET);
    ErrorHandler errorHandler = new ErrorHandler(vertx, false);

    errorHandler.handle(routingContext);

    Mockito.verify(httpServerResponse).setStatusMessage("Bad Request");
    Mockito.verify(httpServerResponse).setStatusCode(400);
    Mockito.verify(httpServerResponse).end(argThat((ArgumentMatcher<String>) argument ->
      argument.contains("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n") &&
        argument.contains("<tspan x=\"10\" dy=\"16\">Error 400: Syntax Error? (line: 1)</tspan>\n")
    ));
  }

  private HttpServerResponse plainResponse() {
    HttpServerResponse httpServerResponse = mock(HttpServerResponse.class);
    MultiMap headers = new HeadersMultiMap();
    when(httpServerResponse.headers()).thenReturn(headers);
    return httpServerResponse;
  }

  private HttpServerResponse jsonServerResponse() {
    HttpServerResponse httpServerResponse = mock(HttpServerResponse.class);
    MultiMap headers = new HeadersMultiMap();
    headers.add(HttpHeaders.CONTENT_TYPE, "application/json");
    when(httpServerResponse.headers()).thenReturn(headers);
    return httpServerResponse;
  }

  private HttpServerRequest mockHttpServerRequest() {
    HttpServerRequest httpServerRequest = mock(HttpServerRequest.class);
    MultiMap headers = new HeadersMultiMap();
    headers.add(HttpHeaders.ACCEPT, "application/json");
    when(httpServerRequest.headers()).thenReturn(headers);
    return httpServerRequest;
  }
}
