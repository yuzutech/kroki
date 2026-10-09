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

public class LiniServiceTest {

  private static final String SOURCE = "|box#api| \"API\"";

  private static Commander commanderMock() throws Exception {
    Commander commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any(String[].class))).thenReturn("<svg>lini</svg>".getBytes());
    return commanderMock;
  }

  private static Lini newLini(Vertx vertx, String safeMode, Commander commander) {
    HashMap<String, Object> config = new HashMap<>();
    if (safeMode != null) {
      config.put("KROKI_SAFE_MODE", safeMode);
    }
    config.put("KROKI_LINI_BIN_PATH", "/path/to/lini");
    return new Lini(vertx, new JsonObject(config), commander);
  }

  @Test
  public void should_disable_filesystem_reads_by_default() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = commanderMock();
    Buffer buffer = newLini(vertx, null, commanderMock).convert(SOURCE, "lini", FileFormat.SVG, new JsonObject()).await(2, TimeUnit.SECONDS);
    assertThat(buffer.toString()).isEqualTo("<svg>lini</svg>");
    Mockito.verify(commanderMock).execute(SOURCE.getBytes(), "/path/to/lini", "-", "--no-fs");
  }

  @Test
  public void should_disable_filesystem_reads_in_safe_mode() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = commanderMock();
    newLini(vertx, "safe", commanderMock).convert(SOURCE, "lini", FileFormat.SVG, new JsonObject()).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute(SOURCE.getBytes(), "/path/to/lini", "-", "--no-fs");
  }

  @Test
  public void should_allow_filesystem_reads_in_unsafe_mode() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = commanderMock();
    newLini(vertx, "unsafe", commanderMock).convert(SOURCE, "lini", FileFormat.SVG, new JsonObject()).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute(SOURCE.getBytes(), "/path/to/lini", "-");
  }

  @Test
  public void should_pass_theme_and_static_options() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = commanderMock();
    JsonObject options = new JsonObject().put("theme", "light/dark").put("static", "");
    newLini(vertx, "secure", commanderMock).convert(SOURCE, "lini", FileFormat.SVG, options).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute(SOURCE.getBytes(), "/path/to/lini", "-", "--no-fs", "--theme=light/dark", "--static");
  }

  @Test
  public void should_keep_a_theme_starting_with_a_dash_in_one_argument() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = commanderMock();
    JsonObject options = new JsonObject().put("theme", "--static");
    newLini(vertx, "secure", commanderMock).convert(SOURCE, "lini", FileFormat.SVG, options).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute(SOURCE.getBytes(), "/path/to/lini", "-", "--no-fs", "--theme=--static");
  }
}
