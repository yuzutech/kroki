package io.kroki.server.service;

import io.kroki.server.DownloadPlantumlNativeImage;
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

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(VertxExtension.class)
@EnabledOnOs(value = OS.LINUX, architectures = "amd64")
public class C4PlantumlServiceTest {

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
  void should_include_c4_puml_file_from_classloader() throws IOException {
    String diagram = "@startuml\n" +
      "!include /path/to/c4.puml # comment \n" +
      "@enduml";
    String result = Plantuml.sanitize(diagram, SafeMode.SECURE);
    assertThat(result).contains("https://github.com/plantuml-stdlib/C4-PlantUML");
  }

  @Test
  void should_preserve_stdlib_include() throws IOException {
    String diagram = "@startuml\n" +
      "!include <c4/C4.puml> # comment \n" +
      "@enduml\n";
    String result = Plantuml.sanitize(diagram, SafeMode.SECURE);
    assertThat(result).isEqualTo(diagram);
  }

  @Test
  void should_not_sanitize_in_unsafe_mode() throws IOException {
    String diagram = "@startuml\n" +
      "!include /path/to/file.puml # comment \n" +
      "!include https://foo.bar\n" +
      "  !includeurl   https://foo.bar\n" +
      "@enduml\n";
    String result = Plantuml.sanitize(diagram, SafeMode.UNSAFE);
    assertThat(result).isEqualTo(diagram);
  }

  @Test
  void should_not_use_network() throws IOException, InterruptedException {
    String diagram = "@startuml\n" +
      "!include C4_Context.puml\n" +
      "\n" +
      "title System Context diagram for Internet Banking System\n" +
      "\n" +
      "Person(customer, \"Banking Customer\", \"A customer of the bank, with personal bank accounts.\")\n" +
      "System(banking_system, \"Internet Banking System\", \"Allows customers to check their accounts.\")\n" +
      "\n" +
      "System_Ext(mail_system, \"E-mail system\", \"The internal Microsoft Exchange e-mail system.\")\n" +
      "System_Ext(mainframe, \"Mainframe Banking System\", \"Stores all of the core banking information.\")\n" +
      "\n" +
      "Rel(customer, banking_system, \"Uses\")\n" +
      "Rel_Back(customer, mail_system, \"Sends e-mails to\")\n" +
      "Rel_Neighbor(banking_system, mail_system, \"Sends e-mails\", \"SMTP\")\n" +
      "Rel(banking_system, mainframe, \"Uses\")\n" +
      "@enduml";
    // non existing proxy!
    System.setProperty("socksProxyHost", "127.0.0.1");
    System.setProperty("socksProxyPort", "1234");
    try {
      // should not use the network!
      byte[] convert = plantumlCommand.convert(Plantuml.sanitize(diagram, SafeMode.SAFE), FileFormat.SVG, new JsonObject());
      assertThat(convert).isNotEmpty();
    } finally {
      System.clearProperty("socksProxyHost");
      System.clearProperty("socksProxyPort");
    }
  }

  @Test
  void should_convert_to_pdf() throws IOException, InterruptedException {
    String diagram = "@startuml\n" +
      "!include C4_Context.puml\n" +
      "\n" +
      "title System Context diagram for Internet Banking System\n" +
      "\n" +
      "Person(customer, \"Banking Customer\", \"A customer of the bank, with personal bank accounts.\")\n" +
      "System(banking_system, \"Internet Banking System\", \"Allows customers to check their accounts.\")\n" +
      "\n" +
      "System_Ext(mail_system, \"E-mail system\", \"The internal Microsoft Exchange e-mail system.\")\n" +
      "System_Ext(mainframe, \"Mainframe Banking System\", \"Stores all of the core banking information.\")\n" +
      "\n" +
      "Rel(customer, banking_system, \"Uses\")\n" +
      "Rel_Back(customer, mail_system, \"Sends e-mails to\")\n" +
      "Rel_Neighbor(banking_system, mail_system, \"Sends e-mails\", \"SMTP\")\n" +
      "Rel(banking_system, mainframe, \"Uses\")\n" +
      "@enduml";
    byte[] convert = plantumlCommand.convert(Plantuml.sanitize(diagram, SafeMode.SAFE), FileFormat.PDF, new JsonObject());
    assertThat(convert).isNotEmpty();
    assertThat(new String(convert, StandardCharsets.UTF_8)).contains("%PDF-1.4");
  }
}
