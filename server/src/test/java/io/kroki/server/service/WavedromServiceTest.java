package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class WavedromServiceTest {

  @Test
  public void should_call_wavedrom() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = mock(Commander.class);
    RoutingContext routingContextMock = mock(RoutingContext.class);
    HttpServerResponse httpServerResponseMock = mock(HttpServerResponse.class);
    when(routingContextMock.response()).thenReturn(httpServerResponseMock);
    when(httpServerResponseMock.putHeader(any(CharSequence.class), any(CharSequence.class))).thenReturn(httpServerResponseMock);
    when(commanderMock.execute(any(), any())).thenReturn("<svg>wavedrom</svg>".getBytes());
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_WAVEDROM_BIN_PATH", "/path/to/wavedrom");
    Wavedrom wavedromService = new Wavedrom(vertx, new JsonObject(config), commanderMock);
    VertxTestContext testContext = new VertxTestContext();
    wavedromService.convert("{}", "wavedrom", FileFormat.SVG, testContext.succeeding(buffer -> testContext.verify(() -> {
      assertThat(buffer.toString()).isEqualTo("<svg>wavedrom</svg>");
      testContext.completeNow();
    })));
    // wait at most 2000ms
    assertThat(testContext.awaitCompletion(2, TimeUnit.SECONDS)).isTrue();
    if (testContext.failed()) {
      throw testContext.causeOfFailure();
    }
    Mockito.verify(commanderMock).execute("{}".getBytes(), "/path/to/wavedrom");
  }
}
