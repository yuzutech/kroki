package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatcher;
import org.mockito.Mockito;

import java.io.IOException;
import java.util.HashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class VegaServiceTest {

  @Test
  public void should_call_vega_with_correct_arguments() throws IOException, InterruptedException {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = mock(Commander.class);
    RoutingContext routingContextMock = mock(RoutingContext.class);
    HttpServerResponse httpServerResponseMock = mock(HttpServerResponse.class);
    when(routingContextMock.response()).thenReturn(httpServerResponseMock);
    when(httpServerResponseMock.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(httpServerResponseMock);
    when(commanderMock.execute(any(), any())).thenReturn("<svg>vega</svg>".getBytes());
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    config.put("KROKI_VEGA_BIN_PATH", "/path/to/vega");
    CountDownLatch lock = new CountDownLatch(2);
    Vega vegaService = new Vega(vertx, new JsonObject(config), Vega.SpecFormat.DEFAULT, commanderMock);
    vegaService.convert(routingContextMock, "{}", "vega", FileFormat.SVG);
    // wait 2000ms for the request to complete
    lock.await(2000, TimeUnit.MILLISECONDS);
    // verify
    Mockito.verify(commanderMock).execute("{}".getBytes(), "/path/to/vega", "--output-format=svg", "--safe-mode=unsafe", "--spec-format=default");
    Mockito.verify(httpServerResponseMock).end(argThat((ArgumentMatcher<Buffer>) argument -> argument.toString().equals("<svg>vega</svg>")));
  }

  @Test
  public void should_call_vega_lite_with_correct_arguments() throws IOException, InterruptedException {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = mock(Commander.class);
    RoutingContext routingContextMock = mock(RoutingContext.class);
    HttpServerResponse httpServerResponseMock = mock(HttpServerResponse.class);
    when(routingContextMock.response()).thenReturn(httpServerResponseMock);
    when(httpServerResponseMock.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(httpServerResponseMock);
    when(commanderMock.execute(any(), any())).thenReturn("<svg>vega-lite</svg>".getBytes());
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    config.put("KROKI_VEGA_BIN_PATH", "/path/to/vega");
    CountDownLatch lock = new CountDownLatch(1);
    Vega vegaService = new Vega(vertx, new JsonObject(config), Vega.SpecFormat.LITE, commanderMock);
    vegaService.convert(routingContextMock, "{}", "vegalite", FileFormat.SVG);
    // wait 2000ms for the request to complete
    lock.await(2000, TimeUnit.MILLISECONDS);
    // verify
    Mockito.verify(commanderMock).execute("{}".getBytes(), "/path/to/vega", "--output-format=svg", "--safe-mode=unsafe", "--spec-format=lite");
    Mockito.verify(httpServerResponseMock).end(argThat((ArgumentMatcher<Buffer>) argument -> argument.toString().equals("<svg>vega-lite</svg>")));
  }
}
