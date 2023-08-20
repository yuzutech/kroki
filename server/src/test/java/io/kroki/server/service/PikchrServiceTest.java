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

public class PikchrServiceTest {

  @Test
  public void should_call_pikchr_with_correct_arguments() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any(String[].class))).thenReturn("<svg>pikchr</svg>".getBytes());
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    config.put("KROKI_PIKCHR_BIN_PATH", "/path/to/pikchr");
    Pikchr pikchrService = new Pikchr(vertx, new JsonObject(config), commanderMock);

    VertxTestContext testContext = new VertxTestContext();
    pikchrService.convert("{}", "pikchr", FileFormat.SVG, new JsonObject(), testContext.succeeding(buffer -> testContext.verify(() -> {
      assertThat(buffer.toString()).isEqualTo("<svg>pikchr</svg>");
      testContext.completeNow();
    })));
    // wait at most 2000ms
    assertThat(testContext.awaitCompletion(2, TimeUnit.SECONDS)).isTrue();
    if (testContext.failed()) {
      throw testContext.causeOfFailure();
    }
    Mockito.verify(commanderMock).execute("{}".getBytes(), "/path/to/pikchr", "--svg-only", "-");
  }
}
