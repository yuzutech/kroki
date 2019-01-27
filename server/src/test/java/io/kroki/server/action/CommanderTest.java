package io.kroki.server.action;

import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class CommanderTest {

  @Test
  public void should_throw_an_exception_when_bin_not_found() {
    assertThatThrownBy(() -> Commander.execute("".getBytes(), "/path/not/found/dot"))
      .isInstanceOf(IOException.class)
      .hasMessageContaining("annot run program \"/path/not/found/dot\"");
  }
}
