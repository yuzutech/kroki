package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import java.util.concurrent.TimeUnit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class D2ServiceTest {

  private Vertx vertx;
  private Commander commanderMock;
  private D2 d2;

  @BeforeEach
  public void setUp() throws Exception {
    vertx = Vertx.vertx();
    commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any(String[].class))).thenReturn("<svg>d2</svg>".getBytes());
    d2 = new D2(vertx, JsonObject.of("KROKI_D2_BIN_PATH", "/path/to/d2"), commanderMock);
  }

  @AfterEach
  public void tearDown() {
    vertx.close();
  }

  private void convert(JsonObject options) throws Throwable {
    d2.convert("a -> b", "d2", FileFormat.SVG, options).await(2, TimeUnit.SECONDS);
  }

  @Test
  public void should_not_pass_any_option_by_default() throws Throwable {
    convert(new JsonObject());
    Mockito.verify(commanderMock).execute("a -> b".getBytes(), "/path/to/d2", "-");
  }

  @ParameterizedTest
  @ValueSource(strings = {"elk", "tala"})
  public void should_pass_an_alternate_layout_engine(String layout) throws Throwable {
    convert(JsonObject.of("layout", layout));
    Mockito.verify(commanderMock).execute("a -> b".getBytes(), "/path/to/d2", "--layout=" + layout, "-");
  }

  @ParameterizedTest
  @ValueSource(strings = {"dagre", "unknown", ""})
  public void should_not_override_the_layout_engine_of_the_diagram(String layout) throws Throwable {
    // the layout engine set in d2-config (or dagre) is used
    convert(JsonObject.of("layout", layout));
    Mockito.verify(commanderMock).execute("a -> b".getBytes(), "/path/to/d2", "-");
  }

  @Test
  public void should_map_theme_names_to_ids() throws Throwable {
    convert(JsonObject.of("theme", "Dark Mauve", "dark-theme", "301"));
    Mockito.verify(commanderMock).execute("a -> b".getBytes(), "/path/to/d2", "--theme=200", "--dark-theme=301", "-");
  }

  @Test
  public void should_fall_back_to_the_default_theme_when_unknown() throws Throwable {
    convert(JsonObject.of("theme", "unknown"));
    Mockito.verify(commanderMock).execute("a -> b".getBytes(), "/path/to/d2", "--theme=0", "-");
  }

  @Test
  public void should_pass_the_other_options() throws Throwable {
    convert(JsonObject.of("pad", "10", "animate-interval", "1000", "sketch", "", "scale", "2"));
    Mockito.verify(commanderMock).execute("a -> b".getBytes(), "/path/to/d2", "--pad=10", "--animate-interval=1000", "--sketch", "--scale=2", "-");
  }
}
