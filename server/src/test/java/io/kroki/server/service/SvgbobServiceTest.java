package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.concurrent.TimeUnit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class SvgbobServiceTest {

  private Vertx vertx;
  private Commander commanderMock;
  private Svgbob svgbob;

  @BeforeEach
  public void setUp() throws Exception {
    vertx = Vertx.vertx();
    commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any(String[].class))).thenReturn("<svg>svgbob</svg>".getBytes());
    svgbob = new Svgbob(vertx, JsonObject.of("KROKI_SVGBOB_BIN_PATH", "/path/to/svgbob"), commanderMock);
  }

  @AfterEach
  public void tearDown() {
    vertx.close();
  }

  @Test
  public void should_pass_the_declared_options_in_order() throws Throwable {
    JsonObject options = JsonObject.of(
      "stroke-width", "3",
      "scale", "2",
      "background", "white",
      "font-size", "14",
      "font-family", "monospace",
      "fill-color", "black",
      "unknown", "ignored"
    );
    svgbob.convert("-->", "svgbob", FileFormat.SVG, options).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute("-->".getBytes(), "/path/to/svgbob",
      "--background=white",
      "--fill-color=black",
      "--font-family=monospace",
      "--font-size=14",
      "--scale=2",
      "--stroke-width=3");
  }

  @Test
  public void should_sanitize_the_values() throws Throwable {
    svgbob.convert("-->", "svgbob", FileFormat.SVG, JsonObject.of("background", "\"red\";--x=$y")).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute("-->".getBytes(), "/path/to/svgbob", "--background=redxy");
  }
}
