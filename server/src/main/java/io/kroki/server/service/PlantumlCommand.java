package io.kroki.server.service;

import io.kroki.server.action.CommandStatusHandler;
import io.kroki.server.action.Commander;
import io.kroki.server.error.DiagramException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.option.DiagramOption;
import io.kroki.server.security.SafeMode;
import io.kroki.server.unit.TimeValue;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PlantumlCommand {

  private static final Logger logger = LoggerFactory.getLogger(PlantumlCommand.class);

  private static final Pattern ERROR_MESSAGE_RX = Pattern.compile(".*ERROR\\n(?<lineNumber>[0-9]+)\\n(?<cause>[^\\n]+)\\n.*", Pattern.MULTILINE | Pattern.DOTALL);

  static final DiagramOption THEME = DiagramOption.value("theme", "Name of a PlantUML theme, for instance cerulean.");
  private static final DiagramOption NO_METADATA = DiagramOption.flag("no-metadata", "Do not save the source of the diagram in the metadata of the generated SVG or PNG.");

  private final String binPath;
  private final String includePath;
  private final String allowListUrl;
  private final String allowListPath;
  private final String securityProfile;
  private final TimeValue convertTimeout;
  private final Commander commander;

  public PlantumlCommand(SafeMode safeMode, JsonObject config) {
    this.binPath = config.getString("KROKI_PLANTUML_BIN_PATH", "plantuml");
    this.includePath = config.getString("KROKI_PLANTUML_INCLUDE_PATH");
    this.allowListUrl = config.getString("KROKI_PLANTUML_ALLOWLIST_URL");
    this.allowListPath = config.getString("KROKI_PLANTUML_ALLOWLIST_PATH");
    String defaultSecurityProfile;
    switch (safeMode) {
      case UNSAFE:
        defaultSecurityProfile = "UNSECURE";
        break;
      case SAFE:
        defaultSecurityProfile = "ALLOWLIST";
        break;
      case SECURE:
      default:
        defaultSecurityProfile = "SANDBOX";
        break;
    }
    this.securityProfile = config.getString("KROKI_PLANTUML_SECURITY_PROFILE", defaultSecurityProfile);
    this.commander = new Commander(
      config,
      new CommandStatusHandler() {
        @Override
        public byte[] handle(int exitValue, byte[] stdout, byte[] stderr) {
          if (exitValue == 0) {
            return stdout;
          }
          if (exitValue == 100) {
            throw new DiagramException("Empty diagram, missing delimiters?");
          }
          if (exitValue == 200) {
            String errorMessage = new String(stderr);
            Matcher matcher = ERROR_MESSAGE_RX.matcher(errorMessage);
            if (matcher.matches()) {
              // PlantUML reports a 0-based line index, relative to the @start line
              String lineIndex = matcher.group("lineNumber");
              String cause = matcher.group("cause");
              throw new DiagramException(cause + " (line: " + lineIndex + ")", cause, Integer.parseInt(lineIndex) + 1, null, -1, null);
            }
            throw new DiagramException("Syntax Error?");
          }
          return CommandStatusHandler.super.handle(exitValue, stdout, stderr);
        }
      }

    );
    if (config.containsKey("KROKI_PLANTUML_CONVERT_TIMEOUT")) {
      String convertPlantumlTimeoutValue = config.getString("KROKI_PLANTUML_CONVERT_TIMEOUT", "20s");
      this.convertTimeout = TimeValue.parseTimeValue(convertPlantumlTimeoutValue, "KROKI_PLANTUML_CONVERT_TIMEOUT");
    } else {
      String convertTimeoutValue = config.getString("KROKI_CONVERT_TIMEOUT", "20s");
      this.convertTimeout = TimeValue.parseTimeValue(convertTimeoutValue, "KROKI_CONVERT_TIMEOUT");
    }
  }

  public List<DiagramOption> getOptions() {
    return List.of(THEME, NO_METADATA);
  }

  public byte[] convert(String source, FileFormat format, JsonObject options) throws IOException, InterruptedException {
    List<String> commandArgs = buildCommandArgs(format, options);

    logger.debug("Executing PlantUML command: {}", commandArgs);

    byte[] result = commander.execute(source.getBytes(), commandArgs.toArray(new String[0]));
    if (format == FileFormat.BASE64) {
      final String encodedBytes = "data:image/png;base64," + Base64.getUrlEncoder().encodeToString(result).replaceAll("\\s", "");
      return encodedBytes.getBytes();
    }
    return result;
  }

  protected List<String> buildCommandArgs(FileFormat format, JsonObject options) {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    if (securityProfile != null) {
      commands.add("-DPLANTUML_SECURITY_PROFILE=" + securityProfile);
    }
    if (allowListUrl != null) {
      commands.add("-Dplantuml.allowlist.url=" + allowListUrl);
    }
    if (allowListPath != null) {
      commands.add("-Dplantuml.allowlist.path=" + allowListPath);
    }
    if (includePath != null) {
      commands.add("-Dplantuml.include.path=" + includePath);
    }
    commands.add("-pipe");
    commands.add("-t" + (format == FileFormat.BASE64 ? FileFormat.PNG.getName() : format.getName()));
    commands.add("-timeout");
    commands.add(String.valueOf(this.convertTimeout.timeUnit().toSeconds(this.convertTimeout.duration())));
    String theme = THEME.get(options);
    if (theme != null && !theme.isBlank()) {
      commands.add("-theme");
      commands.add(theme);
    }
    if (NO_METADATA.isEnabled(options)) {
      commands.add("-nometadata");
    }
    return commands;
  }
}
