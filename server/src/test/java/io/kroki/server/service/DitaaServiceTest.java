package io.kroki.server.service;

import io.kroki.server.DownloadDitaaNativeImage;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.junit5.Checkpoint;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.api.condition.EnabledOnOs;
import org.junit.jupiter.api.condition.OS;
import org.junit.jupiter.api.extension.ExtendWith;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@ExtendWith(VertxExtension.class)
@EnabledOnOs(value = OS.LINUX, architectures = "amd64")
public class DitaaServiceTest {

  private static DitaaCommand ditaaCommand = null;

  @BeforeAll
  @Timeout(60)
  static void prepare(VertxTestContext context, Vertx vertx) {
    Checkpoint checkpoint = context.checkpoint();
    DownloadDitaaNativeImage.download(vertx).onComplete(event -> {
      if (event.failed()) {
        context.failNow(event.cause());
        return;
      }
      ditaaCommand = event.result();
      checkpoint.flag();
    });
  }

  @Test
  public void should_call_ditaa_with_correct_arguments() throws Exception {
    String input = "+---------+\n" +
      "| cBLU    |\n" +
      "|         |\n" +
      "|    +----+\n" +
      "|    |cPNK|\n" +
      "|    |    |\n" +
      "+----+----+";

    // shadows are enabled by default
    byte[] svgWithShadows = ditaaCommand.convert(input, FileFormat.SVG, new JsonObject());
    assertThat(new String(svgWithShadows, StandardCharsets.UTF_8)).contains("filter=\"url(#shadowBlur)\"");

    // disable shadows by setting the no-shadows option
    JsonObject options = new JsonObject();
    options.put("no-shadows", "");
    byte[] svgWithoutShadows = ditaaCommand.convert(input, FileFormat.SVG, options);
    assertThat(new String(svgWithoutShadows, StandardCharsets.UTF_8)).doesNotContain("filter=\"url(#shadowBlur)\"");
  }
}
