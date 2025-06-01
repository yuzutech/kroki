package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
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
    Buffer buffer = pikchrService.convert("{}", "pikchr", FileFormat.SVG, new JsonObject()).await(2, TimeUnit.SECONDS);
    assertThat(buffer.toString()).isEqualTo("<svg>pikchr</svg>");
    Mockito.verify(commanderMock).execute("{}".getBytes(), "/path/to/pikchr", "--svg-only", "-");
  }
}
