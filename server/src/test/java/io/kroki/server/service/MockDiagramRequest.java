package io.kroki.server.service;

import io.vertx.core.Future;
import io.vertx.core.MultiMap;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class MockDiagramRequest {

  private final MIMEHeader mimeHeader;
  private final HttpServerRequest httpServerRequest;
  private final HttpServerResponse httpServerResponse;
  private final RequestBody requestBody;
  private final RoutingContext routingContext;
  private final List<MIMEHeader> accepts = new ArrayList<>();
  private MultiMap params = MultiMap.caseInsensitiveMultiMap();
  private MultiMap headers = MultiMap.caseInsensitiveMultiMap();

  public MockDiagramRequest() {
    routingContext = mock(RoutingContext.class);
    Route currentRoute = mock(Route.class);
    httpServerRequest = mock(HttpServerRequest.class);
    httpServerResponse = mock(HttpServerResponse.class);
    requestBody = mock(RequestBody.class);
    ParsedHeaderValues parsedHeaderValues = mock(ParsedHeaderValues.class);
    mimeHeader = mock(MIMEHeader.class);
    when(parsedHeaderValues.accept()).thenReturn(accepts);
    when(parsedHeaderValues.contentType()).thenReturn(mimeHeader);
    when(routingContext.parsedHeaders()).thenReturn(parsedHeaderValues);
    when(routingContext.request()).thenReturn(httpServerRequest);
    when(routingContext.response()).thenReturn(httpServerResponse);
    when(routingContext.body()).thenReturn(requestBody);
    when(httpServerResponse.closed()).thenReturn(false);
    when(httpServerResponse.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(httpServerResponse);
    when(httpServerResponse.putHeader(any(CharSequence.class), any(Iterable.class))).thenReturn(httpServerResponse);
    when(routingContext.currentRoute()).thenReturn(currentRoute);
    when(httpServerRequest.params()).thenReturn(this.params);
    when(httpServerRequest.headers()).thenReturn(this.headers);
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
    this.params.add(key, value);
    when(httpServerRequest.params()).thenReturn(this.params);
    when(httpServerRequest.getParam(key)).thenReturn(value);
  }

  public void setHeaders(MultiMap headers) {
    this.headers = headers;
    when(httpServerRequest.headers()).thenReturn(this.headers);
  }

  public void setParams(MultiMap params) {
    this.params = params;
    when(httpServerRequest.params()).thenReturn(this.params);
    for (Map.Entry<String, String> entry : params) {
      when(httpServerRequest.getParam(entry.getKey())).thenReturn(entry.getValue());
    }
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
    when(requestBody.asString()).thenReturn(body);
  }

  public void setMethod(HttpMethod method) {
    when(httpServerRequest.method()).thenReturn(method);
  }

  public RoutingContext getRoutingContext() {
    return routingContext;
  }
}
