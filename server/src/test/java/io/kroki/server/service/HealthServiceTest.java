package io.kroki.server.service;

import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
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

public class HealthServiceTest {

  @Test
  void should_get_version_info() {
    HealthHandler healthHandler = new HealthHandler();
    String krokiBuildHash = healthHandler.getKrokiBuildHash();
    String krokiVersionNumber = healthHandler.getKrokiVersionNumber();
    List<ServiceVersion> serviceVersions = healthHandler.getServiceVersions();
    assertThat(krokiBuildHash).isNotEmpty();
    assertThat(krokiVersionNumber).isNotEmpty();
    assertThat(serviceVersions).contains(new ServiceVersion("plantuml", "1.2022.5"));
  }

  @Test
  void should_return_health() {
    RoutingContext routingContextMock = mock(RoutingContext.class);
    HttpServerResponse httpServerResponseMock = mock(HttpServerResponse.class);
    when(routingContextMock.response()).thenReturn(httpServerResponseMock);
    when(httpServerResponseMock.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(httpServerResponseMock);
    Handler<RoutingContext> healthHandler = new HealthHandler().create();
    healthHandler.handle(routingContextMock);
    Mockito.verify(httpServerResponseMock).end(argThat((ArgumentMatcher<String>) argument ->
      {
        JsonObject responseJson = new JsonObject(argument);
        return responseJson.getString("status").equals("pass") && responseJson.getJsonObject("version") != null;
      }
    ));
  }
}
