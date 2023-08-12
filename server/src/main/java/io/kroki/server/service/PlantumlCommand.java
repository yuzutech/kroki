package io.kroki.server.service;

import io.kroki.server.action.CommandStatusHandler;
import io.kroki.server.action.Commander;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.unit.TimeValue;
import io.vertx.core.json.JsonObject;

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

  private static final Pattern ERROR_MESSAGE_RX = Pattern.compile(".*ERROR\\n(?<lineNumber>[0-9]+)\\n(?<cause>[^\\n]+)\\n.*", Pattern.MULTILINE | Pattern.DOTALL);
  private final String binPath;
  private final TimeValue convertTimeout;
  private final Commander commander;

  public PlantumlCommand(JsonObject config) {
    this.binPath = config.getString("KROKI_PLANTUML_BIN_PATH", "plantuml");
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
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
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
    byte[] result = commander.execute(source.getBytes(), commands.toArray(new String[0]));
    if (format == FileFormat.BASE64) {
      final String encodedBytes = "data:image/png;base64," + Base64.getUrlEncoder().encodeToString(result).replaceAll("\\s", "");
      return encodedBytes.getBytes();
    }
    return result;
  }
}
