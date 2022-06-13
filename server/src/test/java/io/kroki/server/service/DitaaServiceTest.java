package io.kroki.server.service;

import io.kroki.server.format.FileFormat;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

public class DitaaServiceTest {

  @Test
  public void should_call_ditaa_with_correct_arguments() throws Exception {
    String input = "+---------+\n" +
      "| cBLU    |\n" +
      "|         |\n" +
      "|    +----+\n" +
      "|    |cPNK|\n" +
      "|    |    |\n" +
      "+----+----+";
    try (ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(input.getBytes()); ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream()) {
      Ditaa.convert(FileFormat.SVG, new JsonObject(), byteArrayInputStream, byteArrayOutputStream);
      // shadows are enabled by default
      assertThat(byteArrayOutputStream.toString()).contains("filter=\"url(#shadowBlur)\"");
    }
    try (ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(input.getBytes()); ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream()) {
      JsonObject options = new JsonObject();
      options.put("no-shadows", "");
      Ditaa.convert(FileFormat.SVG, options, byteArrayInputStream, byteArrayOutputStream);
      // disable shadows by setting the no-shadows option
      assertThat(byteArrayOutputStream.toString()).doesNotContain("filter=\"url(#shadowBlur)\"");
    }
  }
}
