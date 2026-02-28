package io.kroki.server.service;

import io.kroki.server.action.CommandStatusHandler;
import io.kroki.server.action.Commander;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.security.SafeMode;
import io.kroki.server.unit.TimeValue;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class PlantumlCommand {

  private static final Logger logger = LoggerFactory.getLogger(PlantumlCommand.class);

  private static final Pattern ERROR_MESSAGE_RX = Pattern.compile(".*ERROR\\n(?<lineNumber>[0-9]+)\\n(?<cause>[^\\n]+)\\n.*", Pattern.MULTILINE | Pattern.DOTALL);
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
            throw new BadRequestException("Empty diagram, missing delimiters?");
          }
          if (exitValue == 200) {
            String errorMessage = new String(stderr);
            Matcher matcher = ERROR_MESSAGE_RX.matcher(errorMessage);
            String lineNumberMessage = null;
            String causeMessage;
            if (matcher.matches()) {
              lineNumberMessage = "(line: " + matcher.group("lineNumber") + ")";
              causeMessage = matcher.group("cause");
            } else {
              causeMessage = "Syntax Error?";
            }
            String message = Stream.of(causeMessage, lineNumberMessage)
              .filter(Objects::nonNull)
              .collect(Collectors.joining(" "));
            throw new BadRequestException(message);
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
    String theme = options.getString("theme");
    if (theme != null && !theme.isBlank()) {
      commands.add("-theme");
      commands.add(theme);
    }
    String no_metadata = options.getString("no-metadata");
    if (no_metadata != null) {
      commands.add("-nometadata");
    }
    return commands;
  }
}
