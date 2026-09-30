package io.kroki.server.transform;

import io.kroki.server.format.FileFormat;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ThemedSvgPostProcessorTest {

  private static final String SAMPLE = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\">"
    + "<rect fill=\"#ffffff\" width=\"10\" height=\"10\"/></svg>";

  @Test
  void fixedModeLeavesSvgUnchanged() {
    Buffer out = ThemedSvgPostProcessor.maybeApply(
      "mermaid",
      FileFormat.SVG,
      new JsonObject(),
      Buffer.buffer(SAMPLE)
    );
    assertThat(out.toString()).isEqualTo(SAMPLE);
  }

  @Test
  void hostModeMarksRoot() {
    Buffer out = ThemedSvgPostProcessor.maybeApply(
      "mermaid",
      FileFormat.SVG,
      new JsonObject().put("svg-theme", "host"),
      Buffer.buffer(SAMPLE)
    );
    assertThat(out.toString())
      .contains("data-kroki-svg-theme=\"host\"")
      .contains("data-kroki-service=\"mermaid\"")
      .contains("<rect fill=\"#ffffff\"");
  }

  @Test
  void adaptiveModeAddsScaffold() {
    Buffer out = ThemedSvgPostProcessor.maybeApply(
      "plantuml",
      FileFormat.SVG,
      new JsonObject().put("svg-theme", "adaptive"),
      Buffer.buffer(SAMPLE)
    );
    String svg = out.toString();
    assertThat(svg).contains("data-kroki-svg-theme=\"adaptive\"");
    assertThat(svg).contains("prefers-color-scheme: dark");
    assertThat(svg).contains("kroki-svg-theme-adaptive");
  }

  @Test
  void nonSvgIgnored() {
    Buffer png = Buffer.buffer(new byte[]{1, 2, 3});
    Buffer out = ThemedSvgPostProcessor.maybeApply(
      "mermaid",
      FileFormat.PNG,
      new JsonObject().put("svg-theme", "host"),
      png
    );
    assertThat(out.getBytes()).isEqualTo(png.getBytes());
  }
}
