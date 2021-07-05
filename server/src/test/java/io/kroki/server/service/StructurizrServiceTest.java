package io.kroki.server.service;

import com.structurizr.io.plantuml.StructurizrPlantUMLWriter;
import io.kroki.server.format.FileFormat;
import org.junit.jupiter.api.Test;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

public class StructurizrServiceTest {

  @Test
  public void should_convert_getting_started_example() throws IOException {
    String source = read("./gettingstarted.structurizr");
    String expected = read("./gettingstarted.expected.svg");
    byte[] result = Structurizr.convert(source, FileFormat.SVG, new StructurizrPlantUMLWriter());
    assertThat(new String(result)).isEqualToIgnoringNewLines(expected);
  }

  @Test
  public void should_convert_bigbank_example() throws IOException {
    String source = read("./bigbank.structurizr");
    String expected = read("./bigbank.expected.svg");
    byte[] result = Structurizr.convert(source, FileFormat.SVG, new StructurizrPlantUMLWriter());
    assertThat(new String(result)).isEqualToIgnoringNewLines(expected);
  }

  private String read(String name) throws IOException {
    try (BufferedReader buffer = new BufferedReader(new InputStreamReader(StructurizrServiceTest.class.getClassLoader().getResourceAsStream(name)))) {
      return buffer.lines().collect(Collectors.joining("\n"));
    }
  }
}
