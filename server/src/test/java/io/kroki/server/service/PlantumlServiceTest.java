package io.kroki.server.service;

import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.security.SafeMode;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

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
    byte[] convert = Plantuml.convert(Plantuml.sanitize(diagram, SafeMode.SECURE), FileFormat.SVG);
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
    String result = Plantuml.sanitize(diagram, SafeMode.SECURE);
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
    String result = Plantuml.sanitize(diagram, SafeMode.SECURE);
    assertThat(result).isEqualTo(diagram + "\n");
  }

  @Test
  void should_sanitize_include_url() throws IOException {
    String diagram = "@startuml\n" +
      "!include https://foo.bar\n" +
      "  !includeurl   https://foo.bar\n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram, SafeMode.SECURE);
    assertThat(result).isEqualTo("@startuml\n@enduml\n");
  }

  @Test
  void should_sanitize_include_to_local_file() throws IOException {
    String diagram = "@startuml\n" +
      "!include /etc/password\n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram, SafeMode.SECURE);
    assertThat(result).isEqualTo("@startuml\n@enduml\n");
  }

  @Test
  void should_sanitize_include_to_local_file2() throws IOException {
    String diagram = "@startuml\n" +
      "!include /etc/password #<aws/common>\n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram, SafeMode.SECURE);
    assertThat(result).isEqualTo("@startuml\n@enduml\n");
  }

  @Test
  void should_not_sanitize_include_in_unsafe_mode() throws IOException {
    String diagram = "@startuml\n" +
      "!include /foo/bar\n" +
      "!include bar\n" +
      "!include <foo/Bar>\n" +
      "!include https://foo.bar\n" +
      "  !includeurl   https://foo.bar\n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram, SafeMode.UNSAFE);
    assertThat(result).isEqualTo(diagram);
  }

  @Test
  void should_not_sanitize_include_for_search_path_includes_in_safe_mode() throws IOException {
    String diagram = "@startuml\n" +
      "!include bar\n" +
      "!include foo!1\n" +
      "!includesub fooBar!BASIC\n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram, SafeMode.SAFE);
    assertThat(result.trim()).isEqualTo(diagram);
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

  @Test
  void should_return_empty_whitelist_when_config_empty() {
    Map<String, Object> config = new HashMap<>();
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns).isEmpty();
  }

  @Test
  void should_return_empty_list_when_whitelist_file_empty() throws URISyntaxException {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST", Paths.get(PlantumlServiceTest.class.getResource("/whitelist_empty.txt").toURI()).toString());
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns).isEmpty();
  }

  @Test
  void should_return_empty_list_when_file_does_not_exist() {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST", "missing.txt");
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns).isEmpty();
  }

  @Test
  void should_ignore_invalid_regex_from_whitelist_file() throws URISyntaxException {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST", Paths.get(PlantumlServiceTest.class.getResource("/whitelist_invalid.txt").toURI()).toString());
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns).isEmpty();
  }

  @Test
  void should_ignore_invalid_regex_from_whitelist_file_but_continue() throws URISyntaxException {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST", Paths.get(PlantumlServiceTest.class.getResource("/whitelist_mixed.txt").toURI()).toString());
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns)
      .extracting("pattern")
      .containsExactly("\\/valid\\/regex");
  }

  @Test
  void should_ignore_empty_lines_from_whitelist_file_but_continue() throws URISyntaxException {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST", Paths.get(PlantumlServiceTest.class.getResource("/whitelist_empty_lines.txt").toURI()).toString());
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns)
      .extracting("pattern")
      .containsExactly("/path/to/includes", "/other/includes");
  }

  @Test
  void should_return_valid_regexp_from_whitelist_file() throws URISyntaxException {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST", Paths.get(PlantumlServiceTest.class.getResource("/whitelist_valid.txt").toURI()).toString());
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns)
      .extracting("pattern")
      .containsExactly("https:\\/\\/kroki\\.io\\/includes");
  }

  @Test
  void should_ignore_invalid_number_in_whitelist_environment_variable() {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_00", "/path/to/includes");
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns).isEmpty();
  }

  @Test
  void should_add_valid_regex_from_whitelist_environment_variable() {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_0", "/path/to/includes");
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns)
      .extracting("pattern")
      .containsExactly("/path/to/includes");
  }

  @Test
  void should_stop_when_index_missing_in_whitelist_environment_variables() {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_0", "/path/to/includes");
    // index 1 is missing
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_2", "/another/path");
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns)
      .extracting("pattern")
      .containsExactly("/path/to/includes");
  }

  @Test
  void should_iterate_on_whitelist_environment_variables() {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_0", "/path1");
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_1", "/path2");
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_2", "/path3");
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns)
      .extracting("pattern")
      .containsExactly("/path1", "/path2", "/path3");
  }

  @Test
  void should_ignore_invalid_regex_on_whitelist_environment_variables() {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_0", "/path1");
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_1", "this\\is\\an\\invalid\\regular\\/expression");
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_2", "/path3");
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns)
      .extracting("pattern")
      .containsExactly("/path1", "/path3");
  }

  @Test
  void should_trim_regex_on_whitelist_environment_variables() {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_0", "/path1  ");
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_1", "  /path2 ");
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST_2", "\t/path3\n");
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns)
      .extracting("pattern")
      .containsExactly("/path1", "/path2", "/path3");
  }
}
