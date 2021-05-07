package io.kroki.server.service;

import io.kroki.server.format.FileFormat;
import io.kroki.server.security.SafeMode;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

public class C4PlantumlServiceTest {

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
  void should_not_use_network() throws IOException {
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
      byte[] convert = Plantuml.convert(Plantuml.sanitize(diagram, SafeMode.SAFE), FileFormat.SVG);
      assertThat(convert).isNotEmpty();
    } finally {
      System.clearProperty("socksProxyHost");
      System.clearProperty("socksProxyPort");
    }
  }
}
