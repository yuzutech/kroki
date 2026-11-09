package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;

import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(VertxExtension.class)
public class GoatServiceTest {

  private static Goat newGoat(Vertx vertx) {
    JsonObject config = new JsonObject();
    return new Goat(vertx, config, new Commander(config));
  }

  @Test
  public void should_preserve_leading_whitespace_on_the_first_line(Vertx vertx) throws DecodeException {
    // GoAT is whitespace-sensitive: the first line is indented by 4 spaces just
    // like the others. Trimming the source would strip that indentation, shifting
    // the top border to x=0 and misaligning the box.
    String source = "    .------------.\n" +
      "o-->|Hello, world|--*\n" +
      "    '------------'\n";
    String encoded = new String(DiagramSource.encode(source));

    String decoded = newGoat(vertx).getSourceDecoder().decode(encoded);

    assertThat(decoded).isEqualTo(source);
    assertThat(decoded).startsWith("    .");
  }

  @Test
  public void should_accept_css_colors() {
    assertThat(Goat.isValidColor("#FFF")).isTrue();
    assertThat(Goat.isValidColor("#AABBCC80")).isTrue();
    assertThat(Goat.isValidColor("red")).isTrue();
    assertThat(Goat.isValidColor("currentColor")).isTrue();
    assertThat(Goat.isValidColor("rgb(10, 20, 30)")).isTrue();
    assertThat(Goat.isValidColor("rgb(10 20 30 / 50%)")).isTrue();
    assertThat(Goat.isValidColor("hsl(120deg 75% 25%)")).isTrue();
  }

  @Test
  public void should_reject_values_that_could_escape_the_style_element() {
    assertThat(Goat.isValidColor("red} </style><script>alert(1)</script><style>.pwn{color:red")).isFalse();
    assertThat(Goat.isValidColor("red; background: url(https://example.com)")).isFalse();
    assertThat(Goat.isValidColor("red}svg{display:none")).isFalse();
    assertThat(Goat.isValidColor("\"red\"")).isFalse();
    assertThat(Goat.isValidColor("red\n")).isFalse();
    assertThat(Goat.isValidColor("")).isFalse();
  }

  @Test
  public void should_fail_with_a_bad_request_when_a_color_option_is_invalid(Vertx vertx, VertxTestContext context) {
    JsonObject options = new JsonObject().put("svg-color-dark-scheme", "red} </style><script>alert(1)</script><style>");
    newGoat(vertx).convert(".-.\n(_)\n", "goat", FileFormat.SVG, options)
      .onComplete(context.failing(error -> context.verify(() -> {
        assertThat(error).isInstanceOf(BadRequestException.class);
        assertThat(error.getMessage()).contains("svg-color-dark-scheme");
        context.completeNow();
      })));
  }

  @Test
  public void should_pass_the_options(Vertx vertx) throws Throwable {
    Commander commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any(String[].class))).thenReturn("<svg>goat</svg>".getBytes());
    Goat goat = new Goat(vertx, JsonObject.of("KROKI_GOAT_BIN_PATH", "/path/to/goat"), commanderMock);
    JsonObject options = JsonObject.of("svg-color-dark-scheme", "#FFF", "svg-color-light-scheme", "rgb(0, 0, 0)", "utf8", "");
    goat.convert(".-.", "goat", FileFormat.SVG, options).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute(".-.".getBytes(), "/path/to/goat",
      "-svg-color-dark-scheme", "#FFF",
      "-svg-color-light-scheme", "rgb(0, 0, 0)",
      "-utf8");
  }
}
