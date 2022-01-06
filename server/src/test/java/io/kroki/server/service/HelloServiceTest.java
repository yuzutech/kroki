package io.kroki.server.service;

import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.http.HttpHeaders;
import io.vertx.ext.web.RoutingContext;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatcher;
import org.mockito.Mockito;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class HelloServiceTest {

  @Test
  void should_return_hello_as_html_with_table() {
    Vertx vertx = Vertx.vertx();
    HealthHandler healthHandler = new HealthHandler();
    String krokiBuildHash = healthHandler.getKrokiBuildHash();
    String krokiVersionNumber = healthHandler.getKrokiVersionNumber();
    List<ServiceVersion> serviceVersions = healthHandler.getServiceVersions();
    RoutingContext routingContextMock = mock(RoutingContext.class);
    HttpServerResponse httpServerResponseMock = mock(HttpServerResponse.class);
    when(routingContextMock.response()).thenReturn(httpServerResponseMock);
    when(httpServerResponseMock.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(httpServerResponseMock);

    Handler<RoutingContext> helloHandler = new HelloHandler(vertx, serviceVersions, krokiVersionNumber, krokiBuildHash).create();
    helloHandler.handle(routingContextMock);
    Mockito.verify(httpServerResponseMock).putHeader(HttpHeaders.CONTENT_TYPE, "text/html");
    Mockito.verify(httpServerResponseMock).end(argThat((ArgumentMatcher<String>) argument ->
      {
        String response = argument.toString();
        return response.startsWith("<!DOCTYPE html>\n<html");
      }
    ));
    // Contains a table with the right number of version number fields?
    Mockito.verify(httpServerResponseMock).end(argThat((ArgumentMatcher<String>) argument ->
      {
        String response = argument.toString();
        return response.split("<td class=\"has-text-right\">").length-1 == serviceVersions.size();
      }
    ));
  }
}
