package io.kroki.server.action;

import io.kroki.server.unit.TimeValue;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CommanderTest {

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
      } catch (IllegalStateException e) {
        assertThat(e).hasMessageStartingWith("Error: <stdin>: syntax error in line");
        assertThat(e).hasMessageEndingWith(" (exit code 1)");
      }
    }
  }

  @Test
  void should_convert_diagram() throws IOException, InterruptedException {
    if (Files.isExecutable(Paths.get("/usr/bin/dot"))) {
      String source = read("hello.dot");
      byte[] result = new Commander(new JsonObject()).execute(source.getBytes(), "dot", "-T", "svg");
      String output = new String(result);
      assertThat(output.trim()).isEqualTo(read("hello.expected.svg").trim());
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

  private String read(String name) throws IOException {
    try (BufferedReader buffer = new BufferedReader(new InputStreamReader(CommanderTest.class.getClassLoader().getResourceAsStream(name)))) {
      return buffer.lines().collect(Collectors.joining("\n"));
    }
  }
}
