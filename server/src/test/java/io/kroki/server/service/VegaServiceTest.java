package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class VegaServiceTest {

  @Test
  public void should_call_vega_with_correct_arguments() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any())).thenReturn("<svg>vega</svg>".getBytes());
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    config.put("KROKI_VEGA_BIN_PATH", "/path/to/vega");
    Vega vegaService = new Vega(vertx, new JsonObject(config), Vega.SpecFormat.DEFAULT, commanderMock);

    VertxTestContext testContext = new VertxTestContext();
    vegaService.convert("{}", "vega", FileFormat.SVG, new JsonObject(), testContext.succeeding(buffer -> testContext.verify(() -> {
      assertThat(buffer.toString()).isEqualTo("<svg>vega</svg>");
      testContext.completeNow();
    })));
    // wait at most 4000ms
    assertThat(testContext.awaitCompletion(4, TimeUnit.SECONDS)).isTrue();
    if (testContext.failed()) {
      throw testContext.causeOfFailure();
    }
    Mockito.verify(commanderMock).execute("{}".getBytes(), "/path/to/vega", "--output-format=svg", "--safe-mode=unsafe", "--spec-format=default");
  }

  @Test
  public void should_call_vega_lite_with_correct_arguments() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any())).thenReturn("<svg>vega-lite</svg>".getBytes());
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    config.put("KROKI_VEGA_BIN_PATH", "/path/to/vega");
    Vega vegaService = new Vega(vertx, new JsonObject(config), Vega.SpecFormat.LITE, commanderMock);
    VertxTestContext testContext = new VertxTestContext();
    vegaService.convert("{}", "vegalite", FileFormat.SVG, new JsonObject(), testContext.succeeding(buffer -> testContext.verify(() -> {
      assertThat(buffer.toString()).isEqualTo("<svg>vega-lite</svg>");
      testContext.completeNow();
    })));
    // wait at most 4000ms
    assertThat(testContext.awaitCompletion(4, TimeUnit.SECONDS)).isTrue();
    if (testContext.failed()) {
      throw testContext.causeOfFailure();
    }
    Mockito.verify(commanderMock).execute("{}".getBytes(), "/path/to/vega", "--output-format=svg", "--safe-mode=unsafe", "--spec-format=lite");
  }
}
