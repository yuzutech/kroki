package io.kroki.server.action;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.unit.TimeValue;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CommanderTest {

  private static final Logger logger = LoggerFactory.getLogger(CommanderTest.class);

  @Test
  void should_throw_an_exception_when_bin_not_found() {
    assertThatThrownBy(() -> new Commander(new JsonObject()).execute("".getBytes(), "/path/not/found/dot"))
      .isInstanceOf(IOException.class)
      .hasMessageStartingWith("Cannot run program \"/path/not/found/dot\"");
  }

  // Server code injection

  @ParameterizedTest(name = "run #{index} with [{arguments}]")
  @ValueSource(strings = {
    "-",
    "--",
    "--version",
    "--help",
    "$USER",
    "/dev/null; touch /tmp/blns.fail ; echo",
    "`touch /tmp/blns.fail`",
    "$(touch /tmp/blns.fail)",
    "@{[system \"touch /tmp/blns.fail\"]}"
  })
  void should_not_fail(String source) throws IOException, InterruptedException {
    if (Files.isExecutable(Paths.get("/usr/bin/dot"))) {
      try {
        byte[] result = new Commander(new JsonObject()).execute(source.getBytes(), "dot");
        assertThat(Files.exists(Paths.get("/tmp/blns.fail"))).isFalse();
        assertThat(new String(result)).isEqualTo("");
      } catch (BadRequestException e) {
        assertThat(e).hasMessageStartingWith("Error: <stdin>: syntax error in line");
        assertThat(e).hasMessageEndingWith(" (exit code 1)");
      }
    }
  }

  private static final Pattern GRAPHVIZ_CLI_VERSION = Pattern.compile("^dot - graphviz version (?<version>[0-9]{1,2}\\.[0-9]{1,3}\\.[0-9]{1,3}).*");

  @Test
  void should_convert_diagram() throws IOException, InterruptedException {
    if (Files.isExecutable(Paths.get("/usr/bin/dot"))) {
      String source = read("hello.dot");
      byte[] versionResult = new Commander(new JsonObject()).execute(new byte[0], "dot", "-V");
      String versionOutput = new String(versionResult);
      Matcher matcher = GRAPHVIZ_CLI_VERSION.matcher(versionOutput);
      if (matcher.matches()) {
        String version = matcher.group("version");
        // output depends on the version!
        if (version.equals("2.43.0")) {
          byte[] result = new Commander(new JsonObject()).execute(source.getBytes(), "dot", "-T", "svg");
          String output = new String(result);
          assertThat(output.trim()).isEqualTo(read("hello.expected.svg").trim());
        } else {
          logger.warn("GraphViz version mismatch, expected 2.43.0, got " + version + ", unable to run the result, ignoring.");
        }
      }
    } else {
      logger.warn("/usr/bin/dot not found, unable to run the test, ignoring.");
    }
  }

  @Test
  void should_convert_large_diagram() throws IOException, InterruptedException {
    if (Files.isExecutable(Paths.get("/usr/bin/node"))) {
      String source = read("./volcano.vega");
      byte[] result = new Commander(new JsonObject()).execute(source.getBytes(), "node", "../vega/index.js", "--output-format", "svg");
      String output = new String(result);
      assertThat(output.trim()).isEqualTo(read("volcano.expected.svg").trim());
    }
  }

  @Test
  void should_configure_the_timeout_in_milliseconds() {
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_COMMAND_TIMEOUT", "4000ms");
    Commander commander = new Commander(new JsonObject(config));
    assertThat(commander.commandTimeout).isEqualTo(new TimeValue(4000, TimeUnit.MILLISECONDS));
  }

  @Test
  void should_configure_the_timeout_in_seconds() {
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_COMMAND_TIMEOUT", "15s");
    Commander commander = new Commander(new JsonObject(config));
    assertThat(commander.commandTimeout).isEqualTo(new TimeValue(15, TimeUnit.SECONDS));
  }

  @Test
  void should_configure_the_timeout_in_minutes() {
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_COMMAND_TIMEOUT", "1m");
    Commander commander = new Commander(new JsonObject(config));
    assertThat(commander.commandTimeout).isEqualTo(new TimeValue(1, TimeUnit.MINUTES));
  }

  @Test
  void should_throw_an_exception_if_timeunit_invalid() {
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_COMMAND_TIMEOUT", "4y");
    assertThatThrownBy(() -> new Commander(new JsonObject(config)))
      .isInstanceOf(IllegalArgumentException.class)
      .hasMessageStartingWith("Failed to parse environment variable 'KROKI_COMMAND_TIMEOUT' with value '4y' as a time value: unit is missing or unrecognized");
  }

  /**
   * Visually compare two images.
   *
   * @return the pixels difference in percent
   */
  @SuppressWarnings("unused")
  double compareVisually(InputStream refImage, InputStream image) throws IOException {
    BufferedImage ref = ImageIO.read(refImage);
    BufferedImage img = ImageIO.read(image);
    int pixels = ref.getHeight() * ref.getWidth();
    int diff = bufferedImagesEqual(ref, img);
    return diff * 1.0 / pixels;
  }

  int bufferedImagesEqual(BufferedImage ref, BufferedImage img) {
    int pixelDifference = 0;
    int width = Math.max(ref.getWidth(), img.getWidth());
    int height = Math.max(ref.getHeight(), img.getHeight());
    for (int x = 0; x < width; x++) {
      for (int y = 0; y < height; y++) {
        try {
          if (ref.getRGB(x, y) != img.getRGB(x, y)) {
            pixelDifference++;
          }
        } catch (ArrayIndexOutOfBoundsException e) {
          pixelDifference++;
        }
      }
    }
    return pixelDifference;
  }

  private String read(String name) throws IOException {
    try (BufferedReader buffer = new BufferedReader(new InputStreamReader(CommanderTest.class.getClassLoader().getResourceAsStream(name)))) {
      return buffer.lines().collect(Collectors.joining("\n"));
    }
  }
}
