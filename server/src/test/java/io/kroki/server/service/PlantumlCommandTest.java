package io.kroki.server.service;

import io.kroki.server.format.FileFormat;
import io.kroki.server.security.SafeMode;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class PlantumlCommandTest {

  @Test
  public void should_use_sandbox_security_profile_by_default() {
    JsonObject options = new JsonObject();
    PlantumlCommand cmd = new PlantumlCommand(SafeMode.SECURE, options);
    List<String> args = cmd.buildCommandArgs(FileFormat.SVG, options);
    assertThat(args).contains("-DPLANTUML_SECURITY_PROFILE=SANDBOX");
  }

  @Test
  public void should_map_unsafe_mode_to_security_profile() {
    JsonObject options = new JsonObject();
    PlantumlCommand cmd = new PlantumlCommand(SafeMode.UNSAFE, options);
    List<String> args = cmd.buildCommandArgs(FileFormat.SVG, options);
    assertThat(args).contains("-DPLANTUML_SECURITY_PROFILE=UNSECURE");
  }

  @Test
  public void should_map_safe_mode_to_security_profile() {
    JsonObject options = new JsonObject();
    PlantumlCommand cmd = new PlantumlCommand(SafeMode.SAFE, options);
    List<String> args = cmd.buildCommandArgs(FileFormat.SVG, options);
    assertThat(args).contains("-DPLANTUML_SECURITY_PROFILE=ALLOWLIST");
  }

  @Test
  public void should_set_allowlist_url() {
    JsonObject options = new JsonObject();
    options.put("KROKI_PLANTUML_ALLOWLIST_URL", "https://plantuml.com/;http://somelocalserver:8080/commons");
    PlantumlCommand cmd = new PlantumlCommand(SafeMode.SAFE, options);
    List<String> args = cmd.buildCommandArgs(FileFormat.SVG, options);
    assertThat(args).contains("-Dplantuml.allowlist.url=https://plantuml.com/;http://somelocalserver:8080/commons");
  }

  @Test
  public void should_set_allowlist_path() {
    JsonObject options = new JsonObject();
    options.put("KROKI_PLANTUML_ALLOWLIST_PATH", "/usr/common/:/usr/plantuml/");
    PlantumlCommand cmd = new PlantumlCommand(SafeMode.SAFE, options);
    List<String> args = cmd.buildCommandArgs(FileFormat.SVG, options);
    assertThat(args).contains("-Dplantuml.allowlist.path=/usr/common/:/usr/plantuml/");
  }
}
