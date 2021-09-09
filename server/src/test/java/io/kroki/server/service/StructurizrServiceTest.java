package io.kroki.server.service;

import com.structurizr.io.plantuml.StructurizrPlantUMLWriter;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class StructurizrServiceTest {

  @Test
  public void should_convert_getting_started_example() throws IOException {
    String source = read("./gettingstarted.structurizr");
    String expected = read("./gettingstarted.expected.svg");
    byte[] result = Structurizr.convert(source, FileFormat.SVG, new StructurizrPlantUMLWriter(), new JsonObject());
    assertThat(new String(result)).isEqualToIgnoringNewLines(expected);
  }

  @Test
  public void should_convert_bigbank_example_first_view() throws IOException {
    String source = read("./bigbank.structurizr");
    String expected = read("./bigbank.first.expected.svg");
    byte[] result = Structurizr.convert(source, FileFormat.SVG, new StructurizrPlantUMLWriter(), new JsonObject());
    assertThat(new String(result)).isEqualToIgnoringNewLines(expected);
  }

  @Test
  public void should_convert_bigbank_example_container_view() throws IOException {
    String source = read("./bigbank.structurizr");
    String expected = read("./bigbank.containers.expected.svg");
    JsonObject options = new JsonObject();
    options.put("view-key", "Containers");
    byte[] result = Structurizr.convert(source, FileFormat.SVG, new StructurizrPlantUMLWriter(), options);
    assertThat(new String(result)).isEqualToIgnoringNewLines(expected);
  }

  @Test
  public void should_convert_bigbank_example_systemcontext_view() throws IOException {
    String source = read("./bigbank.structurizr");
    String expected = read("./bigbank.systemcontext.expected.svg");
    JsonObject options = new JsonObject();
    options.put("view-key", "SystemContext");
    byte[] result = Structurizr.convert(source, FileFormat.SVG, new StructurizrPlantUMLWriter(), options);
    assertThat(new String(result)).isEqualToIgnoringNewLines(expected);
  }

  @Test
  public void should_throw_exception_when_view_does_not_exist() throws IOException {
    String source = read("./bigbank.structurizr");
    JsonObject options = new JsonObject();
    options.put("view-key", "NonExisting");
    assertThatThrownBy(() ->  Structurizr.convert(source, FileFormat.SVG, new StructurizrPlantUMLWriter(), options))
      .isInstanceOf(BadRequestException.class)
      .hasMessage("Unable to find view for key: NonExisting.");
  }

  @Test
  public void should_throw_exception_when_diagram_is_empty() throws IOException {
    String source = read("./no-view.structurizr");
    assertThatThrownBy(() -> Structurizr.convert(source, FileFormat.SVG, new StructurizrPlantUMLWriter(), new JsonObject()))
      .isInstanceOf(BadRequestException.class)
      .hasMessage("Empty diagram, does not have any view.");
  }

  private String read(String name) throws IOException {
    try (BufferedReader buffer = new BufferedReader(new InputStreamReader(StructurizrServiceTest.class.getClassLoader().getResourceAsStream(name)))) {
      return buffer.lines().collect(Collectors.joining("\n"));
    }
  }
}
