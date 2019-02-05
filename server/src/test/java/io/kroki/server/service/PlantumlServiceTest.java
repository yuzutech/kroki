package io.kroki.server.service;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class PlantumlServiceTest {

  @Test
  void should_return_a_syntax_error_exception() {
    String diagram = "@startuml\nBob\\->Alice hello\n@enduml";
    assertThatThrownBy(() -> Plantuml.convert(diagram, FileFormat.SVG))
      .isInstanceOf(BadRequestException.class)
      .hasMessageStartingWith("Syntax Error? (line: 1)");
  }

  @Test
  void should_return_an_empty_diagram_exception() {
    String diagram = "Bob->Alice:hello";
    assertThatThrownBy(() -> Plantuml.convert(diagram, FileFormat.SVG))
      .isInstanceOf(BadRequestException.class)
      .hasMessageStartingWith("Empty diagram, missing delimiters?");
  }

  @Test
  void should_return_a_diagram() {
    String diagram = "@startuml\nBob->Alice:hello\n@enduml";
    byte[] convert = Plantuml.convert(diagram, FileFormat.SVG);
    assertThat(convert).isNotEmpty();
  }
}
