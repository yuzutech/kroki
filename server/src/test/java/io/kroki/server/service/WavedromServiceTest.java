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

public class WavedromServiceTest {

  @Test
  public void should_call_wavedrom() throws IOException, InterruptedException {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = mock(Commander.class);
    RoutingContext routingContextMock = mock(RoutingContext.class);
    HttpServerResponse httpServerResponseMock = mock(HttpServerResponse.class);
    when(routingContextMock.response()).thenReturn(httpServerResponseMock);
    when(httpServerResponseMock.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(httpServerResponseMock);
    when(commanderMock.execute(any(), any())).thenReturn("<svg></svg>".getBytes());
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_WAVEDROM_BIN_PATH", "/path/to/wavedrom");
    CountDownLatch lock = new CountDownLatch(1);
    Wavedrom wavedromService = new Wavedrom(vertx, new JsonObject(config), commanderMock);
    wavedromService.convert(routingContextMock, "{}", "vega", FileFormat.SVG);
    // wait for close at most 2000ms
    vertx.close(event -> lock.countDown());
    lock.await(2000, TimeUnit.MILLISECONDS);
    // verify
    Mockito.verify(commanderMock).execute("{}".getBytes(), "/path/to/wavedrom");
    Mockito.verify(httpServerResponseMock).end(argThat((ArgumentMatcher<Buffer>) argument -> argument.toString().equals("<svg></svg>")));
  }
}
