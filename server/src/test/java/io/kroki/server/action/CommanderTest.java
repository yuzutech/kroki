package io.kroki.server.action;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CommanderTest {

  @Test
  void should_throw_an_exception_when_bin_not_found() {
    assertThatThrownBy(() -> Commander.execute("".getBytes(), "/path/not/found/dot"))
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
        byte[] result = Commander.execute(source.getBytes(), "dot");
        assertThat(Files.exists(Paths.get("/tmp/blns.fail"))).isFalse();
        assertThat(new String(result)).isEqualTo("");
      } catch (IllegalStateException e) {
        assertThat(e).hasMessageStartingWith("Command returns an error (exit code 1) Error: <stdin>: syntax error in line");
      }
    }
  }
}
