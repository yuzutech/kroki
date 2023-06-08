package io.kroki.server.service;

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
public class SymbolatorServiceTest {

  @Test
  public void should_call_symbolator_with_correct_arguments() throws Exception {
    SymbolatorCommand symbolatorCommand = new SymbolatorCommand(new JsonObject());

    String input = "module counter( clock, count );\n" +
      "input   clock;\n" +
      "output  [7:0] count;\n" +
      "endmodule\n";

    // Opaque background is enabled by default
    byte[] svgWithOpaqueBackground = symbolatorCommand.convert(input, FileFormat.SVG, new JsonObject());
    // Assert that the file looks like an SVG
    assertThat(new String(svgWithOpaqueBackground, StandardCharsets.UTF_8)).contains("svg");
    // Assert that expected things are in the diagram
    assertThat(new String(svgWithOpaqueBackground, StandardCharsets.UTF_8)).contains("counter");
    assertThat(new String(svgWithOpaqueBackground, StandardCharsets.UTF_8)).contains("clock");
    assertThat(new String(svgWithOpaqueBackground, StandardCharsets.UTF_8)).contains("count");

    // Assert that the background is white if transparent is not set.
    assertThat(new String(svgWithOpaqueBackground, StandardCharsets.UTF_8)).contains("width=\"100%\" height=\"100%\" fill=\"white\"");
    
    // Enable transparent background by setting the transparent option
    JsonObject transparentOptions = new JsonObject();
    transparentOptions.put("transparent", "");
    byte[] svgWithTransparentBackground = symbolatorCommand.convert(input, FileFormat.SVG, transparentOptions);
    assertThat(new String(svgWithTransparentBackground, StandardCharsets.UTF_8)).doesNotContain("width=\"100%\" height=\"100%\" fill=\"white\"");

    // Create a png
    byte[] pngWithOpaqueBackground = symbolatorCommand.convert(input, FileFormat.PNG, new JsonObject());
    // Assert that the png starts with the PNG header
    assertThat(pngWithOpaqueBackground[1]).isEqualTo((byte)'P');
    assertThat(pngWithOpaqueBackground[2]).isEqualTo((byte)'N');
    assertThat(pngWithOpaqueBackground[3]).isEqualTo((byte)'G');
  }
}
