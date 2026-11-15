package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.error.UnsupportedFormatException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.option.DiagramOption;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class SmarterDiagrams implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = List.of(FileFormat.SVG, FileFormat.PNG, FileFormat.PDF);
  private static final Pattern IDENTIFIER = Pattern.compile("[a-zA-Z0-9_.:][a-zA-Z0-9_.:-]{0,127}");
  private static final DiagramOption THEME = DiagramOption.oneOf(
    "theme",
    "Built-in color theme of the diagram.",
    "light",
    "dark",
    "catppuccin-latte",
    "catppuccin-frappe",
    "catppuccin-macchiato",
    "catppuccin-mocha",
    "solarized-light",
    "solarized-dark",
    "base16-eighties",
    "base16-ocean",
    "base16-gruvbox-dark",
    "base16-nord",
    "base16-onedark",
    "base16-dracula",
    "base16-tokyo-night",
    "base16-github"
  );
  private static final DiagramOption VIEW = DiagramOption.value("view", "Named view projection defined in the diagram (cannot be combined with step).");
  private static final DiagramOption STEP = DiagramOption.value("step", "Progressive disclosure step ID defined in the diagram (cannot be combined with view).");

  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;
  private final Commander commander;

  public SmarterDiagrams(Vertx vertx, JsonObject config, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_SMARTERDIAGRAMS_BIN_PATH", "smarter-diagrams");
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
    this.commander = commander;
  }

  @Override
  public List<FileFormat> getSupportedFormats() {
    return SUPPORTED_FORMATS;
  }

  @Override
  public SourceDecoder getSourceDecoder() {
    return sourceDecoder;
  }

  @Override
  public String getVersion() {
    return "0.1.0";
  }

  @Override
  public List<DiagramOption> getOptions() {
    return List.of(THEME, VIEW, STEP);
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    if (fileFormat == null || !SUPPORTED_FORMATS.contains(fileFormat)) {
      return Future.failedFuture(new UnsupportedFormatException(fileFormat == null ? null : fileFormat.getName(), serviceName, SUPPORTED_FORMATS));
    }
    return vertx.executeBlocking(() -> {
      byte[] result = smarterDiagrams(sourceDecoded.getBytes(StandardCharsets.UTF_8), fileFormat, options);
      return Buffer.buffer(result);
    });
  }

  private byte[] smarterDiagrams(byte[] source, FileFormat fileFormat, JsonObject options) throws IOException, InterruptedException, IllegalStateException {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    commands.add("-"); // read from stdin
    commands.add("--format");
    commands.add(fileFormat.getName());

    String theme = THEME.get(options);
    if (theme != null) {
      if (!THEME.values().contains(theme)) {
        throw new BadRequestException("Unknown Smarter Diagrams theme: " + theme);
      }
      commands.add("--theme");
      commands.add(theme);
    }

    String view = VIEW.get(options);
    if (view != null) {
      if (!IDENTIFIER.matcher(view).matches()) {
        throw new BadRequestException("Invalid value for option view: must be a valid identifier.");
      }
    }

    String step = STEP.get(options);
    if (step != null) {
      if (!IDENTIFIER.matcher(step).matches()) {
        throw new BadRequestException("Invalid value for option step: must be a valid identifier.");
      }
    }

    if (view != null && step != null) {
      throw new BadRequestException("Options view and step cannot be combined.");
    }
    if (view != null) {
      commands.add("--view");
      commands.add(view);
    }
    if (step != null) {
      commands.add("--step");
      commands.add(step);
    }

    return commander.execute(source, commands.toArray(new String[0]));
  }
}
