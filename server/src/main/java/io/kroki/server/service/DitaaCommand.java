package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.kroki.server.option.DiagramOption;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DitaaCommand {

  private static final DiagramOption NO_ANTIALIAS = DiagramOption.flag("no-antialias", "Disable antialiasing.");
  private static final DiagramOption NO_SEPARATION = DiagramOption.flag("no-separation", "Prevent the separation of the common edges of shapes.");
  private static final DiagramOption ROUND_CORNERS = DiagramOption.flag("round-corners", "Use rounded corners for shapes.");
  private static final DiagramOption SCALE = DiagramOption.value("scale", "Scale factor for the rendered diagram.");
  private static final DiagramOption NO_SHADOWS = DiagramOption.flag("no-shadows", "Disable drop shadows.");
  private static final DiagramOption TABS = DiagramOption.value("tabs", "Number of spaces a tab is interpreted as (8 by default).");
  private static final DiagramOption BACKGROUND = DiagramOption.value("background", "Background color as a six-digit hexadecimal number, for instance FF0000. Overridden by transparent.");
  private static final DiagramOption TRANSPARENT = DiagramOption.flag("transparent", "Use a transparent background.");

  private final String binPath;
  private final Commander commander;
  private static final Logger logger = LoggerFactory.getLogger(DitaaCommand.class);

  public DitaaCommand(JsonObject config) {
    this.binPath = config.getString("KROKI_DITAA_BIN_PATH", "ditaa");
    this.commander = new Commander(config);
  }

  public byte[] convert(String source, FileFormat format, JsonObject options) throws IOException, InterruptedException {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    if (format.equals(FileFormat.SVG)) {
      commands.add("--svg");
    }
    if (NO_ANTIALIAS.isEnabled(options)) {
      commands.add("--no-antialias");
    }
    if (NO_SEPARATION.isEnabled(options)) {
      commands.add("--no-separation");
    }
    if (ROUND_CORNERS.isEnabled(options)) {
      commands.add("--round-corners");
    }
    String scale = SCALE.get(options);
    if (scale != null) {
      commands.add("--scale");
      commands.add(scale);
    }
    if (NO_SHADOWS.isEnabled(options)) {
      commands.add("--no-shadows");
    }
    String tabs = TABS.get(options);
    if (tabs != null) {
      commands.add("--tabs");
      commands.add(tabs);
    }
    String background = BACKGROUND.get(options);
    if (background != null) {
      commands.add("--background");
      commands.add(background);
    }
    if (TRANSPARENT.isEnabled(options)) {
      commands.add("--transparent");
    }
    commands.add("-");
    logger.info("commands: {}", Arrays.toString(commands.toArray(new String[0])));
    return commander.execute(source.getBytes(), commands.toArray(new String[0]));
  }

  public List<DiagramOption> getOptions() {
    return List.of(
      NO_ANTIALIAS, NO_SEPARATION, ROUND_CORNERS, SCALE, NO_SHADOWS, TABS, BACKGROUND, TRANSPARENT);
  }
}
