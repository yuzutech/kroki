package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.vertx.core.json.JsonObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class DitaaCommand {

  private final String binPath;
  private final Commander commander;

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
    String noAntialias = options.getString("no-antialias");
    if (noAntialias != null) {
      commands.add("--no-antialias");
    }
    String noSeparation = options.getString("no-separation");
    if (noSeparation != null) {
      commands.add("--no-separation");
    }
    String roundCorners = options.getString("round-corners");
    if (roundCorners != null) {
      commands.add("--round-corners");
    }
    String scale = options.getString("scale");
    if (scale != null) {
      commands.add("--scale " + scale);
    }
    String noShadows = options.getString("no-shadows");
    if (noShadows != null) {
      commands.add("--no-shadows");
    }
    String tabs = options.getString("tabs");
    if (tabs != null) {
      commands.add("--tabs " + tabs);
    }
    commands.add("-");
    return commander.execute(source.getBytes(), commands.toArray(new String[0]));
  }
}
