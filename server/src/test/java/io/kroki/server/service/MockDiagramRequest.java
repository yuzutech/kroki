package io.kroki.server.service;

import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.ext.web.MIMEHeader;
import io.vertx.ext.web.ParsedHeaderValues;
import io.vertx.ext.web.Route;
import io.vertx.ext.web.RoutingContext;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class MockDiagramRequest {

  private MIMEHeader mimeHeader;
  private HttpServerRequest httpServerRequest;
  private RoutingContext routingContext;
  private List<MIMEHeader> accepts = new ArrayList<>();

  public MockDiagramRequest() {
    routingContext = mock(RoutingContext.class);
    Route currentRoute = mock(Route.class);
    httpServerRequest = mock(HttpServerRequest.class);
    ParsedHeaderValues parsedHeaderValues = mock(ParsedHeaderValues.class);
    mimeHeader = mock(MIMEHeader.class);
    when(parsedHeaderValues.accept()).thenReturn(accepts);
    when(parsedHeaderValues.contentType()).thenReturn(mimeHeader);
    when(routingContext.parsedHeaders()).thenReturn(parsedHeaderValues);
    when(routingContext.request()).thenReturn(httpServerRequest);
    when(routingContext.currentRoute()).thenReturn(currentRoute);
  }

  public void addAccept(String mimeType) {
    addAccept(mimeType, 1);
  }

  public void addAccept(String mimeType, int weightedOrder) {
    MIMEHeader mimeHeader = mock(MIMEHeader.class);
    String[] parts = mimeType.split("/");
    when(mimeHeader.component()).thenReturn(parts[0]);
    when(mimeHeader.subComponent()).thenReturn(parts[1]);
    when(mimeHeader.weightedOrder()).thenReturn(weightedOrder);
    when(mimeHeader.value()).thenReturn(mimeType);
    accepts.add(mimeHeader);
  }

  public void addParam(String key, String value) {
    when(httpServerRequest.getParam(key)).thenReturn(value);
  }

  public void setPath(String path) {
    when(httpServerRequest.path()).thenReturn(path);
  }

  public void setContentType(String mimeType) {
    setContentType(mimeType, 1);
  }

  public void setContentType(String mimeType, int weightedOrder) {
    String[] parts = mimeType.split("/");
    when(mimeHeader.component()).thenReturn(parts[0]);
    when(mimeHeader.subComponent()).thenReturn(parts[1]);
    when(mimeHeader.value()).thenReturn(mimeType);
    when(mimeHeader.weightedOrder()).thenReturn(weightedOrder);
  }

  public void setBodyAsString(String body) {
    when(routingContext.getBodyAsString()).thenReturn(body);
  }

  public void setMethod(HttpMethod method) {
    when(httpServerRequest.method()).thenReturn(method);
  }

  public RoutingContext getRoutingContext() {
    return routingContext;
  }
}
