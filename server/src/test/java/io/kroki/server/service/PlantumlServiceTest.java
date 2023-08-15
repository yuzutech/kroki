package io.kroki.server.service;

import io.kroki.server.DownloadPlantumlNativeImage;
import io.kroki.server.action.DitaaContext;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.security.SafeMode;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.junit5.Checkpoint;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.api.condition.EnabledOnOs;
import org.junit.jupiter.api.condition.OS;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(VertxExtension.class)
@EnabledOnOs(value = OS.LINUX, architectures = "amd64")
public class PlantumlServiceTest {

  private static PlantumlCommand plantumlCommand = null;

  @BeforeAll
  @Timeout(60)
  static void prepare(VertxTestContext context, Vertx vertx) throws InterruptedException {
    Checkpoint checkpoint = context.checkpoint();
    DownloadPlantumlNativeImage.download(vertx).onComplete(event -> {
      if (event.failed()) {
        context.failNow(event.cause());
        return;
      }
      plantumlCommand = event.result();
      checkpoint.flag();
    });
  }

  @Test
  void should_return_a_syntax_error_exception() {
    String diagram = "@startuml\nBob\\->Alice hello\n@enduml";
    assertThatThrownBy(() -> plantumlCommand.convert(diagram, FileFormat.SVG, new JsonObject()))
      .isInstanceOf(BadRequestException.class)
      .hasMessageStartingWith("Syntax Error? (line: 1)");
  }

  @Test
  void should_return_a_diagram() throws IOException, InterruptedException {
    String diagram = "@startuml\nBob->Alice:hello\n@enduml";
    byte[] convert = plantumlCommand.convert(diagram, FileFormat.SVG, new JsonObject());
    assertThat(convert).isNotEmpty();
  }

  @Test
  void should_preserve_archimate_stdlib_include() throws IOException, InterruptedException {
    String diagram = "@startuml\n" +
      "!include <archimate/Archimate>\n" +
      "\n" +
      "title Archimate Sample - Internet Browser\n" +
      "\n" +
      "' Elements\n" +
      "Business_Object(businessObject, \"A Business Object\")\n" +
      "Business_Process(someBusinessProcess,\"Some Business Process\")\n" +
      "Business_Service(itSupportService, \"IT Support for Business (Application Service)\")\n" +
      "\n" +
      "Application_DataObject(dataObject, \"Web Page Data \\n 'on the fly'\")\n" +
      "Application_Function(webpageBehaviour, \"Web page behaviour\")\n" +
      "Application_Component(ActivePartWebPage, \"Active Part of the web page \\n 'on the fly'\")\n" +
      "\n" +
      "Technology_Artifact(inMemoryItem,\"in memory / 'on the fly' html/javascript\")\n" +
      "Technology_Service(internetBrowser, \"Internet Browser Generic & Plugin\")\n" +
      "Technology_Service(internetBrowserPlugin, \"Some Internet Browser Plugin\")\n" +
      "Technology_Service(webServer, \"Some web server\")\n" +
      "\n" +
      "'Relationships\n" +
      "Rel_Flow_Left(someBusinessProcess, businessObject, \"\")\n" +
      "Rel_Serving_Up(itSupportService, someBusinessProcess, \"\")\n" +
      "Rel_Specialization_Up(webpageBehaviour, itSupportService, \"\")\n" +
      "Rel_Flow_Right(dataObject, webpageBehaviour, \"\")\n" +
      "Rel_Specialization_Up(dataObject, businessObject, \"\")\n" +
      "Rel_Assignment_Left(ActivePartWebPage, webpageBehaviour, \"\")\n" +
      "Rel_Specialization_Up(inMemoryItem, dataObject, \"\")\n" +
      "Rel_Realization_Up(inMemoryItem, ActivePartWebPage, \"\")\n" +
      "Rel_Specialization_Right(inMemoryItem,internetBrowser, \"\")\n" +
      "Rel_Serving_Up(internetBrowser, webpageBehaviour, \"\")\n" +
      "Rel_Serving_Up(internetBrowserPlugin, webpageBehaviour, \"\")\n" +
      "Rel_Aggregation_Right(internetBrowser, internetBrowserPlugin, \"\")\n" +
      "Rel_Access_Up(webServer, inMemoryItem, \"\")\n" +
      "Rel_Serving_Up(webServer, internetBrowser, \"\")\n" +
      "@enduml";
    byte[] convert = plantumlCommand.convert(Plantuml.sanitize(diagram, SafeMode.SAFE), FileFormat.SVG, new JsonObject());
    assertThat(convert).isNotEmpty();
  }

  @Test
  void should_preserve_elastic_stdlib_include() throws IOException, InterruptedException {
    String diagram = "@startuml\n" +
      "!include <elastic/common>\n" +
      "!include <elastic/elasticsearch/elasticsearch>\n" +
      "!include <elastic/logstash/logstash>\n" +
      "!include <elastic/kibana/kibana>\n" +
      "\n" +
      "ELASTICSEARCH(ElasticSearch, \"Search and Analyze\",database)\n" +
      "LOGSTASH(Logstash, \"Parse and Transform\",node)\n" +
      "KIBANA(Kibana, \"Visualize\",agent) \n" +
      "\n" +
      "Logstash -right-> ElasticSearch: Transformed Data\n" +
      "ElasticSearch -right-> Kibana: Data to View\n" +
      "@enduml";
    byte[] convert = plantumlCommand.convert(Plantuml.sanitize(diagram, SafeMode.SAFE), FileFormat.SVG, new JsonObject());
    assertThat(convert).isNotEmpty();
  }

  @Test
  void should_preserve_logos_stdlib_include() throws IOException, InterruptedException {
    String diagram = "@startuml\n" +
      "!include <logos/kafka>\n" +
      "!include <logos/cassandra>\n" +
      "!include <logos/flask>\n" +
      "!include <logos/kotlin>\n" +
      "\n" +
      "title Gil Barbara's logos example\n" +
      "\n" +
      "skinparam monochrome true\n" +
      "\n" +
      "rectangle \"<$flask>\\nwebapp\" as webapp\n" +
      "queue \"<$kafka>\" as kafka\n" +
      "rectangle \"<$kotlin>\\ndaemon\" as daemon\n" +
      "database \"<$cassandra>\" as cassandra\n" +
      "\n" +
      "webapp -> kafka\n" +
      "kafka -> daemon\n" +
      "daemon --> cassandra\n" +
      "@enduml";
    byte[] convert = plantumlCommand.convert(Plantuml.sanitize(diagram, SafeMode.SAFE), FileFormat.SVG, new JsonObject());
    assertThat(convert).isNotEmpty();
  }

  @Test
  void should_preserve_stdlib_include() throws IOException, InterruptedException {
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
    byte[] convert = plantumlCommand.convert(Plantuml.sanitize(diagram, SafeMode.SECURE), FileFormat.SVG, new JsonObject());
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
      "!include <classy/core>\n" +
      "!include <cloudinsight/kafka>\n" +
      "!include <cloudogu/tools/docker>\n" +
      "!include <DomainStory/domainStory>\n" +
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
  void should_sanitize_include_to_local_file_even_if_whitelisted_when_secure_mode_secure() throws IOException {
    String diagram = "@startuml\n" +
      "!include /etc/password\n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram, SafeMode.SECURE, Collections.singletonList(Pattern.compile("/etc/password")));
    assertThat(result).isEqualTo("@startuml\n@enduml\n");
  }

  @Test
  void should_preserve_include_to_local_file_if_whitelisted_and_secure_mode_safe_or_unsafe() throws IOException {
    String diagram = "@startuml\n" +
      "!include    /etc/password    # comment \n" +
      "@enduml\n";
    String result = Plantuml.sanitize(diagram, SafeMode.SAFE, Collections.singletonList(Pattern.compile("/etc/password")));
    assertThat(result).isEqualTo(diagram);
  }

  @Test
  void should_include_index_in_regular_expression() throws IOException {
    String diagram = "@startuml\n" +
      "!include    /etc/password!1    # comment \n" +
      "@enduml\n";
    String result = Plantuml.sanitize(diagram, SafeMode.SAFE, Collections.singletonList(Pattern.compile("/etc/password!1")));
    assertThat(result).isEqualTo(diagram);
  }

  @Test
  void should_extract_path_without_comment() {
    Matcher matcher = Plantuml.INCLUDE_RX.matcher("!include   /etc/password!1   # comment");
    assertThat(matcher.matches()).isTrue();
    assertThat(matcher.group("path")).isEqualTo("/etc/password!1");
  }

  @Test
  void should_extract_path_with_escaped_spaces() {
    Matcher matcher = Plantuml.INCLUDE_RX.matcher("!include /etc/path\\ with\\ spaces/file # comment");
    assertThat(matcher.matches()).isTrue();
    assertThat(matcher.group("path")).isEqualTo("/etc/path\\ with\\ spaces/file");
  }

  @Test
  void should_extract_remote_path_from_include() {
    Matcher matcher = Plantuml.INCLUDE_RX.matcher("!include https://foo.bar");
    assertThat(matcher.matches()).isTrue();
    assertThat(matcher.group("path")).isEqualTo("https://foo.bar");
  }

  @Test
  void should_extract_remote_path_from_includeurl_with_spaces_before_after() {
    Matcher matcher = Plantuml.INCLUDE_RX.matcher("  !includeurl   https://foo.bar");
    assertThat(matcher.matches()).isTrue();
    assertThat(matcher.group("path")).isEqualTo("https://foo.bar");
  }

  @Test
  void should_preserve_include_with_comment_to_local_file_if_whitelisted_and_secure_mode_safe_or_unsafe() throws IOException {
    String diagram = "@startuml\n" +
      "!include   /etc/password   # comment \n" +
      "@enduml\n";
    String result = Plantuml.sanitize(diagram, SafeMode.SAFE, Collections.singletonList(Pattern.compile("/etc/password")));
    assertThat(result).isEqualTo(diagram);
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
    assertThatThrownBy(() -> plantumlCommand.convert(diagram, FileFormat.SVG, new JsonObject()))
      .hasMessage("cannot include /etc/password (line: 1)");
  }

  @Test
  void should_return_an_ascii_text_diagram() throws IOException, InterruptedException {
    String diagram = "@startuml\nBob->Alice:hello\n@enduml";
    byte[] convert = plantumlCommand.convert(diagram, FileFormat.TXT, new JsonObject());
    //@formatter:off
    assertThat(new String(convert)).isEqualTo(
      "     ,---.          ,-----.\n" +
      "     |Bob|          |Alice|\n" +
      "     `-+-'          `--+--'\n" +
      "       |    hello      |   \n" +
      "       |-------------->|   \n" +
      "     ,-+-.          ,--+--.\n" +
      "     |Bob|          |Alice|\n" +
      "     `---'          `-----'\n");
    //@formatter:on
  }

  @Test
  void should_return_an_unicode_text_diagram() throws IOException, InterruptedException {
    String diagram = "@startuml\nBob->Alice:hello\n@enduml";
    byte[] convert = plantumlCommand.convert(diagram, FileFormat.UTXT, new JsonObject());
    //@formatter:off
    assertThat(new String(convert)).isEqualTo(
      "     ┌───┐          ┌─────┐\n" +
      "     │Bob│          │Alice│\n" +
      "     └─┬─┘          └──┬──┘\n" +
      "       │    hello      │   \n" +
      "       │──────────────>│   \n" +
      "     ┌─┴─┐          ┌──┴──┐\n" +
      "     │Bob│          │Alice│\n" +
      "     └───┘          └─────┘\n");
    //@formatter:on
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
      .extractingResultOf("pattern", String.class)
      .containsExactly("\\/valid\\/regex");
  }

  @Test
  void should_ignore_empty_lines_from_whitelist_file_but_continue() throws URISyntaxException {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST", Paths.get(PlantumlServiceTest.class.getResource("/whitelist_empty_lines.txt").toURI()).toString());
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns)
      .extractingResultOf("pattern", String.class)
      .containsExactly("/path/to/includes", "/other/includes");
  }

  @Test
  void should_return_valid_regexp_from_whitelist_file() throws URISyntaxException {
    Map<String, Object> config = new HashMap<>();
    config.put("KROKI_PLANTUML_INCLUDE_WHITELIST", Paths.get(PlantumlServiceTest.class.getResource("/whitelist_valid.txt").toURI()).toString());
    List<Pattern> patterns = Plantuml.parseIncludeWhitelist(new JsonObject(config));
    assertThat(patterns)
      .extractingResultOf("pattern", String.class)
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
      .extractingResultOf("pattern", String.class)
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
      .extractingResultOf("pattern", String.class)
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
      .extractingResultOf("pattern", String.class)
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
      .extractingResultOf("pattern", String.class)
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
      .extractingResultOf("pattern", String.class)
      .containsExactly("/path1", "/path2", "/path3");
  }

  @ParameterizedTest
  @ValueSource(strings = {
    "@startuml\nditaa -> hello\n@enduml",
    "@startuml\n@starditaa->@endditaa\n@enduml",
    "@startuml\n[@startditaa->@endditaa\n@enduml",
    "@startuml\nBob->Alice: \\\nditaa\nFoo->Bar\n@enduml",
  })
  void should_not_find_ditaa_context(String input) {
    DitaaContext ditaaContext = Plantuml.findDitaaContext(input);
    assertThat(ditaaContext).isNull();
  }

  @Test
  void should_find_ditaa_context_with_ditaa_keyword() {
    DitaaContext ditaaContext = Plantuml.findDitaaContext("@startuml\n" +
      "ditaa\n" +
      "    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n" +
      "@enduml");
    assertThat(ditaaContext).isNotNull();
    assertThat(ditaaContext.getOptions()).isNull();
    assertThat(ditaaContext.getSource()).isEqualTo("    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n"
    );
  }

  @Test
  void should_find_ditaa_context_with_ditaa_keyword_empty_opts() {
    DitaaContext ditaaContext = Plantuml.findDitaaContext("@startuml\n" +
      "ditaa()\n" +
      "    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n" +
      "@enduml");
    assertThat(ditaaContext).isNotNull();
    assertThat(ditaaContext.getOptions()).isEqualTo("");
    assertThat(ditaaContext.getSource()).isEqualTo("    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n"
    );
  }

  @Test
  void should_find_ditaa_context_with_ditaa_keyword_opts() {
    DitaaContext ditaaContext = Plantuml.findDitaaContext("@startuml\n" +
      "ditaa(--no-shadows, scale=0.7)\n" +
      "    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n" +
      "@enduml");
    assertThat(ditaaContext).isNotNull();
    assertThat(ditaaContext.getOptions()).isEqualTo("--no-shadows, scale=0.7");
    assertThat(ditaaContext.getSource()).isEqualTo("    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n"
    );
  }

  @Test
  void should_find_ditaa_context_with_startditaa_opts() {
    DitaaContext ditaaContext = Plantuml.findDitaaContext("@startditaa -E\n" +
      "    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n" +
      "@endditaa");
    assertThat(ditaaContext).isNotNull();
    assertThat(ditaaContext.getOptions()).isEqualTo(" -E");
    assertThat(ditaaContext.getSource()).isEqualTo("    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n"
    );
  }

  @Test
  void should_extract_startditaa_block() {
    DitaaContext ditaaContext = Plantuml.findDitaaContext("@startuml\n" +
      "\n" +
      "  @startditaa -E\n" +
      "    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n" +
      "\n  " +
      "@endditaa\n" +
      "" +
      "" +
      "" +
      "" +
      "" +
      "@endditaa\n" +
      "@enduml");
    assertThat(ditaaContext).isNotNull();
    assertThat(ditaaContext.getOptions()).isEqualTo(" -E");
    assertThat(ditaaContext.getSource()).isEqualTo("    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n" +
      "\n"
    );
  }

  @Test
  void should_extract_ditaa_keyword_block() {
    DitaaContext ditaaContext = Plantuml.findDitaaContext("@startuml\n" +
      "\n" +
      "  ditaa(-E)\n" +
      "    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n" +
      "\n  " +
      "@endditaa\n" +
      "" +
      "" +
      "" +
      "" +
      "" +
      "@endditaa\n" +
      "@enduml");
    assertThat(ditaaContext).isNotNull();
    assertThat(ditaaContext.getOptions()).isEqualTo("-E");
    assertThat(ditaaContext.getSource()).isEqualTo("    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n" +
      "\n"
    );
  }

  @Test
  void should_extract_ditaa_keyword_block_without_opts() {
    DitaaContext ditaaContext = Plantuml.findDitaaContext("@startuml\n" +
      "\n" +
      "  ditaa  \n" +
      "    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n" +
      "\n  " +
      "@endditaa\n" +
      "" +
      "" +
      "" +
      "" +
      "" +
      "@endditaa\n" +
      "@enduml");
    assertThat(ditaaContext).isNotNull();
    assertThat(ditaaContext.getOptions()).isNull();
    assertThat(ditaaContext.getSource()).isEqualTo("    Input                           Output\n" +
      "\n" +
      "+-----------+                     +----------+\n" +
      "|  Client   |=------------------->| Kroki.io |\n" +
      "+-----------+                     +----------+\n" +
      "\n"
    );
  }

  @Test
  void should_use_specified_theme() throws IOException, InterruptedException {
    String diagram = "@startuml\nBob->Alice:hello\n@enduml";
    JsonObject options = new JsonObject();
    options.put("theme", "minty");
    byte[] convert = plantumlCommand.convert(diagram, FileFormat.SVG, options);
    String osName = System.getProperty("os.name").toLowerCase();
    String expectedFileName = "./plantuml_with_minty_theme.svg";
    if (osName.contains("mac")) {
      expectedFileName = "./plantuml_with_minty_theme_macos.svg";
    }
    assertThat(stripComments(new String(convert))).isEqualTo(read(expectedFileName));
  }

  @Test
  void should_include_awslib() throws IOException, InterruptedException {
    String diagram = "!include <awslib/AWSCommon>\n" +
            "!include <awslib/Groups/all.puml>\n" +
            "\n" +
            "AWSAccountGroup(externalAccount, \"AWS account external\") {\n" +
            "\n" +
            "}";
    byte[] convert = plantumlCommand.convert(diagram, FileFormat.SVG, new JsonObject());
    assertThat(new String(convert)).contains("xlink:href=\"data:image/png;base64,");
  }

  @Test
  void should_include_openiconic() throws IOException, InterruptedException {
    String diagram = "listopeniconic";
    byte[] convert = plantumlCommand.convert(diagram, FileFormat.SVG, new JsonObject());
    System.out.println(new String(convert));
    Pattern pattern = Pattern.compile("<path d=");
    String output = new String(convert);
    int countOccurrences= (output.length() - output.replace("<path d=\"", "").length()) / "<path d=\"".length();
    assertThat(countOccurrences).isEqualTo(223); // 223 icons
  }

  private String read(String name) throws IOException {
    try (BufferedReader buffer = new BufferedReader(new InputStreamReader(PlantumlServiceTest.class.getClassLoader().getResourceAsStream(name)))) {
      return buffer.lines().collect(Collectors.joining("\n"));
    }
  }

  private String stripComments(String xmlContent) {
    return xmlContent.replaceAll("<!--[\\s\\S]*?-->", "");
  }
}
