package io.kroki.server.service;

import io.kroki.server.format.FileFormat;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class SymbolatorCommandTest {

  private final SymbolatorCommand command = new SymbolatorCommand(new JsonObject());

  @Test
  public void should_pass_title_as_a_flag() {
    JsonObject options = new JsonObject().put("title", "My title");
    List<String> args = command.buildCommandArgs(FileFormat.SVG, options);
    assertThat(args).contains("--title");
    assertThat(args).doesNotContain("My title");
  }

  @Test
  public void should_pass_library_name_when_title_is_set() {
    JsonObject options = new JsonObject()
      .put("title", "")
      .put("library-name", "mylib");
    List<String> args = command.buildCommandArgs(FileFormat.SVG, options);
    assertThat(args).contains("--title", "--libname=mylib");
  }

  @Test
  public void should_pass_library_name_starting_with_a_dash_as_a_single_argument() {
    JsonObject options = new JsonObject()
      .put("title", "")
      .put("library-name", "--debug");
    List<String> args = command.buildCommandArgs(FileFormat.SVG, options);
    assertThat(args).contains("--libname=--debug");
    assertThat(args).doesNotContain("--debug");
  }

  @Test
  public void should_ignore_library_name_without_title() {
    JsonObject options = new JsonObject().put("library-name", "mylib");
    List<String> args = command.buildCommandArgs(FileFormat.SVG, options);
    assertThat(args).noneMatch(arg -> arg.startsWith("--libname") || arg.equals("--title"));
  }
}
