package io.kroki.server.service;

import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SwaggerHandlerTest {

  @Test
  void should_serve_openapi_specification() {
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerRequest request = mock(HttpServerRequest.class);
    HttpServerResponse response = mock(HttpServerResponse.class);
    when(routingContext.request()).thenReturn(request);
    when(request.path()).thenReturn("/openapi.yaml");
    when(routingContext.response()).thenReturn(response);
    when(response.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(response);

    new SwaggerHandler().create().handle(routingContext);

    verify(response).putHeader(HttpHeaders.CONTENT_TYPE, "application/yaml; charset=utf-8");
    verify(response).end(org.mockito.ArgumentMatchers.contains("openapi: 3.0.3"));
  }

  @Test
  void should_serve_swagger_ui() {
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerRequest request = mock(HttpServerRequest.class);
    HttpServerResponse response = mock(HttpServerResponse.class);
    when(routingContext.request()).thenReturn(request);
    when(request.path()).thenReturn("/swagger");
    when(routingContext.response()).thenReturn(response);
    when(response.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(response);

    new SwaggerHandler().create().handle(routingContext);

    verify(response).putHeader(HttpHeaders.CONTENT_TYPE, "text/html; charset=utf-8");
    verify(response).end(org.mockito.ArgumentMatchers.contains("/openapi.yaml"));
  }

  @Test
  void should_serve_external_openapi_files() {
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerRequest request = mock(HttpServerRequest.class);
    HttpServerResponse response = mock(HttpServerResponse.class);
    when(routingContext.request()).thenReturn(request);
    when(request.path()).thenReturn("/openapi/paths/conversions/plantuml.yaml");
    when(routingContext.response()).thenReturn(response);
    when(response.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(response);

    new SwaggerHandler().create().handle(routingContext);

    verify(response).putHeader(HttpHeaders.CONTENT_TYPE, "application/yaml; charset=utf-8");
    verify(response).end(org.mockito.ArgumentMatchers.contains("plantumlGet"));
  }

  @Test
  void should_serve_common_openapi_definitions() {
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerRequest request = mock(HttpServerRequest.class);
    HttpServerResponse response = mock(HttpServerResponse.class);
    when(routingContext.request()).thenReturn(request);
    when(request.path()).thenReturn("/openapi/common/parameters.yaml");
    when(routingContext.response()).thenReturn(response);
    when(response.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(response);

    new SwaggerHandler().create().handle(routingContext);

    verify(response).putHeader(HttpHeaders.CONTENT_TYPE, "application/yaml; charset=utf-8");
    verify(response).end(org.mockito.ArgumentMatchers.contains("OutputFormat"));
  }

  @Test
  void should_reject_unrecognized_openapi_resource_paths() {
    RoutingContext routingContext = mock(RoutingContext.class);
    HttpServerRequest request = mock(HttpServerRequest.class);
    when(routingContext.request()).thenReturn(request);
    when(request.path()).thenReturn("/openapi/../application.properties");

    new SwaggerHandler().create().handle(routingContext);

    verify(routingContext).fail(404);
  }
}
