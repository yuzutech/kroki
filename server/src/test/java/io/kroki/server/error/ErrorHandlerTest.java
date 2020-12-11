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
import org.mockito.Mockito;

import java.util.HashSet;
import java.util.Set;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ErrorHandlerTest {

  @Test
  void should_return_internal_server_error_json() {
    Vertx vertx = Vertx.vertx();
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerResponse httpServerResponse = jsonServerResponse();
    HttpServerRequest httpServerRequest = mock(HttpServerRequest.class);

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
    HttpServerRequest httpServerRequest = mock(HttpServerRequest.class);

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
    HttpServerRequest httpServerRequest = mock(HttpServerRequest.class);

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
    HttpServerRequest httpServerRequest = mock(HttpServerRequest.class);

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

  private HttpServerResponse jsonServerResponse() {
    HttpServerResponse httpServerResponse = mock(HttpServerResponse.class);

    MultiMap headers = new HeadersMultiMap();
    headers.add(HttpHeaders.CONTENT_TYPE, "application/json");
    when(httpServerResponse.headers()).thenReturn(headers);
    return httpServerResponse;
  }
}
