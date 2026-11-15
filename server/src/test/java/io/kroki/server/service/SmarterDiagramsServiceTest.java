package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.UnsupportedFormatException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(VertxExtension.class)
public class SmarterDiagramsServiceTest {

  private static final String SOURCE = "client -> api: \"HTTPS\"\n";

  private static Commander commanderMock() throws Exception {
    Commander commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any(String[].class))).thenReturn("<svg>smarterdiagrams</svg>".getBytes(StandardCharsets.UTF_8));
    return commanderMock;
  }

  private static SmarterDiagrams newService(Vertx vertx, Commander commander) {
    JsonObject config = new JsonObject().put("KROKI_SMARTERDIAGRAMS_BIN_PATH", "/path/to/smarter-diagrams");
    return new SmarterDiagrams(vertx, config, commander);
  }

  @Test
  public void should_call_smarter_diagrams_with_svg_format(Vertx vertx) throws Throwable {
    Commander commanderMock = commanderMock();
    Buffer buffer = newService(vertx, commanderMock)
      .convert(SOURCE, "smarterdiagrams", FileFormat.SVG, new JsonObject())
      .await(2, TimeUnit.SECONDS);
    assertThat(buffer.toString()).isEqualTo("<svg>smarterdiagrams</svg>");
    Mockito.verify(commanderMock).execute(
      SOURCE.getBytes(StandardCharsets.UTF_8),
      "/path/to/smarter-diagrams",
      "-",
      "--format",
      "svg"
    );
  }

  @Test
  public void should_call_smarter_diagrams_with_png_and_pdf_formats(Vertx vertx) throws Throwable {
    Commander commanderMock = commanderMock();
    SmarterDiagrams service = newService(vertx, commanderMock);

    service.convert(SOURCE, "smarterdiagrams", FileFormat.PNG, new JsonObject()).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute(
      SOURCE.getBytes(StandardCharsets.UTF_8),
      "/path/to/smarter-diagrams",
      "-",
      "--format",
      "png"
    );

    service.convert(SOURCE, "smarterdiagrams", FileFormat.PDF, new JsonObject()).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute(
      SOURCE.getBytes(StandardCharsets.UTF_8),
      "/path/to/smarter-diagrams",
      "-",
      "--format",
      "pdf"
    );
  }

  @Test
  public void should_pass_theme_and_step_options(Vertx vertx) throws Throwable {
    Commander commanderMock = commanderMock();
    JsonObject options = new JsonObject()
      .put("theme", "catppuccin-mocha")
      .put("step", "s1");
    newService(vertx, commanderMock)
      .convert(SOURCE, "smarterdiagrams", FileFormat.SVG, options)
      .await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute(
      SOURCE.getBytes(StandardCharsets.UTF_8),
      "/path/to/smarter-diagrams",
      "-",
      "--format",
      "svg",
      "--theme",
      "catppuccin-mocha",
      "--step",
      "s1"
    );
  }

  @Test
  public void should_pass_view_option(Vertx vertx) throws Throwable {
    Commander commanderMock = commanderMock();
    JsonObject options = new JsonObject().put("view", "overview");
    newService(vertx, commanderMock)
      .convert(SOURCE, "smarterdiagrams", FileFormat.SVG, options)
      .await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute(
      SOURCE.getBytes(StandardCharsets.UTF_8),
      "/path/to/smarter-diagrams",
      "-",
      "--format",
      "svg",
      "--view",
      "overview"
    );
  }

  @Test
  public void should_reject_unknown_theme(Vertx vertx, VertxTestContext context) throws Throwable {
    Commander commanderMock = commanderMock();
    JsonObject options = new JsonObject().put("theme", "--theme-file");
    newService(vertx, commanderMock)
      .convert(SOURCE, "smarterdiagrams", FileFormat.SVG, options)
      .onComplete(context.failing(error -> context.verify(() -> {
        assertThat(error).isInstanceOf(BadRequestException.class);
        assertThat(error.getMessage()).contains("Unknown Smarter Diagrams theme");
        context.completeNow();
      })));
  }

  @Test
  public void should_reject_combining_view_and_step(Vertx vertx, VertxTestContext context) throws Throwable {
    Commander commanderMock = commanderMock();
    JsonObject options = new JsonObject().put("view", "overview").put("step", "s1");
    newService(vertx, commanderMock)
      .convert(SOURCE, "smarterdiagrams", FileFormat.SVG, options)
      .onComplete(context.failing(error -> context.verify(() -> {
        assertThat(error).isInstanceOf(BadRequestException.class);
        assertThat(error.getMessage()).contains("cannot be combined");
        context.completeNow();
      })));
  }

  @Test
  public void should_reject_option_starting_with_dash_or_invalid_characters(Vertx vertx, VertxTestContext context) throws Throwable {
    Commander commanderMock = commanderMock();
    newService(vertx, commanderMock)
      .convert(SOURCE, "smarterdiagrams", FileFormat.SVG, new JsonObject().put("view", "--help"))
      .onComplete(context.failing(error1 -> context.verify(() -> {
        assertThat(error1).isInstanceOf(BadRequestException.class);
        newService(vertx, commanderMock)
          .convert(SOURCE, "smarterdiagrams", FileFormat.SVG, new JsonObject().put("step", "../etc"))
          .onComplete(context.failing(error2 -> context.verify(() -> {
            assertThat(error2).isInstanceOf(BadRequestException.class);
            context.completeNow();
          })));
      })));
  }

  @Test
  public void should_reject_unsupported_format(Vertx vertx, VertxTestContext context) throws Throwable {
    Commander commanderMock = commanderMock();
    newService(vertx, commanderMock)
      .convert(SOURCE, "smarterdiagrams", FileFormat.TXT, new JsonObject())
      .onComplete(context.failing(error -> context.verify(() -> {
        assertThat(error).isInstanceOf(UnsupportedFormatException.class);
        context.completeNow();
      })));
  }
}
