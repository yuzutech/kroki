package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

public class TikZServiceTest {

  private Vertx vertx;
  private Commander commanderMock;
  private TikZ tikzService;

  @BeforeEach
  public void setUp() throws Exception {
    vertx = Vertx.vertx();
    commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any(String[].class))).thenReturn("<svg>tikz</svg>".getBytes());
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    config.put("KROKI_TIKZ2SVG_BIN_PATH", "/path/to/tikz2svg");
    tikzService = new TikZ(vertx, new JsonObject(config), commanderMock);
  }

  @AfterEach
  public void tearDown() {
    vertx.close();
  }

  @Test
  public void should_call_tikz2svg_without_page() throws Throwable {
    Buffer buffer = tikzService.convert("test", "tikz", FileFormat.SVG, new JsonObject()).await(2, TimeUnit.SECONDS);
    assertThat(buffer.toString()).isEqualTo("<svg>tikz</svg>");
    Mockito.verify(commanderMock).execute("test".getBytes(), "/path/to/tikz2svg", "svg", "0");
  }

  @Test
  public void should_call_tikz2svg_with_page() throws Throwable {
    JsonObject options = new JsonObject();
    options.put("page", "2");
    Buffer buffer = tikzService.convert("test", "tikz", FileFormat.SVG, options).await(2, TimeUnit.SECONDS);
    assertThat(buffer.toString()).isEqualTo("<svg>tikz</svg>");
    Mockito.verify(commanderMock).execute("test".getBytes(), "/path/to/tikz2svg", "svg", "0", "2");
  }

  @Test
  public void should_normalize_page() throws Throwable {
    JsonObject options = new JsonObject();
    options.put("page", " 007 ");
    tikzService.convert("test", "tikz", FileFormat.PNG, options).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute("test".getBytes(), "/path/to/tikz2svg", "png", "0", "7");
  }

  @ParameterizedTest
  @ValueSource(strings = {"", "abc", "0", "-1", "1-3", "1,3", "1; rm -rf /", "--help", "99999999999"})
  public void should_reject_invalid_page(String page) throws Exception {
    JsonObject options = new JsonObject();
    options.put("page", page);
    assertThatThrownBy(() -> tikzService.convert("test", "tikz", FileFormat.SVG, options).await(2, TimeUnit.SECONDS))
      .isInstanceOf(BadRequestException.class)
      .hasMessageContaining("must be a positive integer");
    verifyNoInteractions(commanderMock);
  }
}
