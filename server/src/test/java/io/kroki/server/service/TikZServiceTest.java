package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class TikZServiceTest {

  @Test
  public void should_call_tikz2svg_without_page() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any(String[].class)))
      .thenReturn("<svg>tikz</svg>".getBytes());

    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "0");
    config.put("KROKI_TIKZ2SVG_BIN_PATH", "/path/to/tikz2svg");

    TikZ tikzService = new TikZ(vertx, new JsonObject(config), commanderMock);

    JsonObject options = new JsonObject();

    Buffer buffer = tikzService
      .convert("test", "tikz", FileFormat.SVG, options)
      .await(2, TimeUnit.SECONDS);

    assert buffer != null;
    verify(commanderMock).execute(
      eq("test".getBytes()),
      eq("/path/to/tikz2svg"),
      eq("svg"),
      any(String.class)
    );
  }

  @Test
  public void should_call_tikz2svg_with_page() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any(String[].class)))
      .thenReturn("<svg>tikz</svg>".getBytes());

    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "0");
    config.put("KROKI_TIKZ2SVG_BIN_PATH", "/path/to/tikz2svg");

    TikZ tikzService = new TikZ(vertx, new JsonObject(config), commanderMock);

    JsonObject options = new JsonObject();
    options.put("page", "2");

    Buffer buffer = tikzService
      .convert("test", "tikz", FileFormat.SVG, options)
      .await(2, TimeUnit.SECONDS);

    assert buffer != null;
    verify(commanderMock).execute(
      eq("test".getBytes()),
      eq("/path/to/tikz2svg"),
      eq("svg"),
      any(String.class),
      eq("2")
    );
  }
}
