package io.kroki.server.service;

import com.structurizr.export.plantuml.StructurizrPlantUMLExporter;
import io.kroki.server.DownloadPlantumlNativeImage;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.security.SafeMode;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.junit5.Checkpoint;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.assertj.core.api.Assumptions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.api.condition.EnabledOnOs;
import org.junit.jupiter.api.condition.OS;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static io.kroki.server.service.TestUtils.readTestResource;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(VertxExtension.class)
@EnabledOnOs(value = OS.LINUX, architectures = "amd64")
public class StructurizrServiceTest {

  private static PlantumlCommand plantumlCommand = null;

  @BeforeAll
  static void checkDotAvailable() {
    Assumptions.assumeThat(Files.isExecutable(Paths.get("/usr/bin/dot")))
      .as("/usr/bin/dot not found, skipping test.")
      .isTrue();
  }

  @BeforeAll
  @Timeout(60)
  static void prepare(VertxTestContext context, Vertx vertx) {
    Checkpoint checkpoint = context.checkpoint();
    DownloadPlantumlNativeImage.download(vertx).onComplete(event -> {
      if (event.failed()) {
        context.failNow(event.cause());
        return;
      }
      String plantumlBinPath = event.result();
      JsonObject options = new JsonObject();
      options.put("KROKI_PLANTUML_BIN_PATH", plantumlBinPath);
      plantumlCommand = Structurizr.createPlantumlCommand(SafeMode.SAFE, options);
      checkpoint.flag();
    });
  }

  private String convert(String sourceFilename) throws IOException, InterruptedException {
    return convert(sourceFilename, SafeMode.SAFE, JsonObject.of());
  }

  private String convert(String sourceFilename,
                         JsonObject options) throws IOException, InterruptedException {
    return convert(sourceFilename, SafeMode.SAFE, options);
  }

  private String convert(String sourceFilename,
                         SafeMode safeMode,
                         JsonObject options) throws IOException, InterruptedException {
    byte[] result = Structurizr.convert(readTestResource(sourceFilename), FileFormat.SVG, plantumlCommand, new StructurizrPlantUMLExporter(), safeMode, options);
    return PlantUMLUtils.stripComments(new String(result));
  }

  @ParameterizedTest
  @ValueSource(strings = {"diagram", ""})
  public void should_convert_getting_started_example(String output) throws IOException, InterruptedException {
    SnapshotAssert.assertThat(convert("./gettingstarted.structurizr",
        output.isEmpty() ? JsonObject.of() : JsonObject.of("output", output)))
      .matchesSnapshot("gettingstarted.expected.svg");
  }

  @Test
  public void should_convert_bigbank_example_container_view() throws IOException, InterruptedException {
    SnapshotAssert.assertThat(convert("./bigbank.structurizr",
        JsonObject.of("view-key", "Containers")))
      .matchesSnapshot(
        "bigbank.containers.expected.svg");
  }

  @Test
  public void should_convert_bigbank_example_systemcontext_view() throws IOException, InterruptedException {
    SnapshotAssert.assertThat(convert("./bigbank.structurizr",
        JsonObject.of("view-key", "SystemContext")))
      .matchesSnapshot("bigbank.systemcontext.expected.svg");
  }

  @Test
  public void should_convert_bigbank_example_systemcontext_legend() throws IOException, InterruptedException {
    SnapshotAssert.assertThat(convert("./bigbank.structurizr",
        JsonObject.of("view-key", "SystemContext",
          "output", "legend")))
      .matchesSnapshot("bigbank.systemcontext.legend.expected.svg");
  }

  @Test
  public void should_convert_aws_example() throws IOException, InterruptedException {
    SnapshotAssert.assertThat(convert("./aws.structurizr"))
      .matchesSnapshot("aws.expected.svg");
  }

  @Test
  public void should_convert_docs_example() throws IOException {
    assertThatThrownBy(() -> convert("docs.structurizr"))
      .isInstanceOf(BadRequestException.class)
      .hasMessageStartingWith("Unable to parse the Structurizr DSL. !docs is not permitted (feature structurizr.feature.dsl.documentation is not enabled) at line 5: !docs src/test/resources/docs.");
  }

  @Test
  public void should_convert_docs_example_unsafe() throws IOException, InterruptedException {
    SnapshotAssert.assertThat(convert("./docs.structurizr", SafeMode.UNSAFE, JsonObject.of()))
      .matchesSnapshot("docs.expected.svg");
  }

  @Test
  public void should_throw_exception_when_view_does_not_exist() throws IOException {
    assertThatThrownBy(() -> convert("./bigbank.structurizr", JsonObject.of("view-key", "NonExisting")))
      .isInstanceOf(BadRequestException.class)
      .hasMessage("Unable to find view for key: NonExisting.");
  }

  @Test
  public void should_throw_exception_when_diagram_is_empty() throws IOException {
    assertThatThrownBy(() -> convert("./no-view.structurizr"))
      .isInstanceOf(BadRequestException.class)
      .hasMessage("Empty diagram, does not have any view.");
  }

  @Test
  public void should_throw_exception_when_script_directive_used() throws IOException {
    assertThatThrownBy(() -> convert("./script.structurizr", SafeMode.UNSAFE, JsonObject.of()))
      .isInstanceOf(BadRequestException.class)
      .hasMessageStartingWith("Unable to parse the Structurizr DSL. Error running inline script, caused by java.lang.RuntimeException: Could not load a scripting engine for extension \"kts\" at line 5");
  }

  @Test
  public void should_throw_exception_when_script_directive_used_safe() throws IOException {
    assertThatThrownBy(() -> convert("./script.structurizr"))
      .isInstanceOf(BadRequestException.class)
      .hasMessageStartingWith("Unable to parse the Structurizr DSL. !script is not permitted (feature structurizr.feature.dsl.scripts is not enabled) at line 2:");
  }

  @Test
  public void should_throw_exception_when_unknown_output_specified() {
    assertThatThrownBy(() -> convert("./bigbank.structurizr", JsonObject.of("output", "invalid")))
      .isInstanceOf(BadRequestException.class)
      .hasMessageStartingWith("Unknown output option: invalid");
  }

  @Test
  public void should_preserve_styles_defined_in_workspace_while_applying_theme() throws IOException, InterruptedException {
    SnapshotAssert.assertThat(convert("./workspace-style-with-theme.structurizr"))
      .matchesSnapshot("workspace-style-with-theme.svg");
  }
}
