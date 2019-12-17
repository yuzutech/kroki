package io.kroki.server.service;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import org.assertj.core.api.ThrowableAssert;
import org.junit.jupiter.api.Test;

import java.io.IOException;

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

  @Test
  void should_preserve_stdlib_include() throws IOException {
    String diagram = "@startuml\n" +
      "!include <azure/AzureRaw>\n" +
      "!include <azure/Databases/AzureCosmosDb>\n" +
      "!include <azure/Compute/AzureFunction>\n" +
      "\n" +
      "component \"<color:red><$AzureFunction></color>\" as myFunction\n" +
      "database \"<color:#0072C6><$AzureCosmosDb></color>\" as myCosmosDb\n" +
      "rectangle \"<color:AZURE_SYMBOL_COLOR><$AzureCosmosDb></color>\" as mySecondCosmosDb\n" +
      "AzureFunction(mySecondFunction, \"Stream Processing\", \"Consumption\")\n" +
      "\n" +
      "myFunction --> myCosmosDb\n" +
      "mySecondFunction --> mySecondCosmosDb\n" +
      "@enduml";
    byte[] convert = Plantuml.convert(Plantuml.sanitize(diagram), FileFormat.SVG);
    assertThat(convert).isNotEmpty();
  }

  @Test
  void should_remove_invalid_lib_include() throws IOException {
    String diagram = "@startuml\n" +
      "!include <foo/AzureRaw>\n" +
      "!include <foo/azure>\n" +
      "!include <azure>\n" +
      "!include <azure\n" +
      "!include </azure\n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram);
    assertThat(result).isEqualTo("@startuml\n@enduml\n");
  }

  @Test
  void should_preserve_valid_lib_include() throws IOException {
    String diagram = "@startuml\n" +
      "!include <aws/common>\n" +
      "!include <awslib/Database/Aurora.puml>\n" +
      "!include <azure/AzureCommon.puml>\n" +
      "!include <c4/C4.puml>\n" +
      "!include <cloudinsight/kafka>\n" +
      "!include <cloudogu/tools/docker>\n" +
      "!include <kubernetes/k8s-sprites-unlabeled-25pct>\n" +
      "!include <material/folder_move>\n" +
      "!include <office/Servers/database_server>\n" +
      "!include <osa/ai.puml>\n" +
      "!include <tupadr3/common>\n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram);
    assertThat(result).isEqualTo(diagram + "\n");
  }

  @Test
  void should_sanitize_include_url() throws IOException {
    String diagram = "@startuml\n" +
      "!include https://foo.bar\n" +
      "  !includeurl   https://foo.bar\n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram);
    assertThat(result).isEqualTo("@startuml\n@enduml\n");
  }

  @Test
  void should_sanitize_include_to_local_file() throws IOException {
    String diagram = "@startuml\n" +
      "!include /etc/password\n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram);
    assertThat(result).isEqualTo("@startuml\n@enduml\n");
  }

  @Test
  void should_not_include_local_file() {
    String diagram = "@startuml\n" +
      "!include /etc/password\n" +
      "@enduml";
    assertThatThrownBy(() -> Plantuml.convert(diagram, FileFormat.SVG))
      .hasMessage("cannot include /etc/password (line: 1)");
  }

  @Test
  void should_return_an_ascii_text_diagram() {
    String diagram = "@startuml\nBob->Alice:hello\n@enduml";
    byte[] convert = Plantuml.convert(diagram, FileFormat.TXT);
    assertThat(new String(convert)).isEqualTo(
      "     ,---.          ,-----.\n" +
      "     |Bob|          |Alice|\n" +
      "     `-+-'          `--+--'\n" +
      "       |    hello      |   \n" +
      "       |-------------->|   \n" +
      "     ,-+-.          ,--+--.\n" +
      "     |Bob|          |Alice|\n" +
      "     `---'          `-----'\n");
  }

  @Test
  void should_return_an_unicode_text_diagram() {
    String diagram = "@startuml\nBob->Alice:hello\n@enduml";
    byte[] convert = Plantuml.convert(diagram, FileFormat.UTXT);
    assertThat(new String(convert)).isEqualTo(
      "     ┌───┐          ┌─────┐\n" +
      "     │Bob│          │Alice│\n" +
      "     └─┬─┘          └──┬──┘\n" +
      "       │    hello      │   \n" +
      "       │──────────────>│   \n" +
      "     ┌─┴─┐          ┌──┴──┐\n" +
      "     │Bob│          │Alice│\n" +
      "     └───┘          └─────┘\n");
  }
}
