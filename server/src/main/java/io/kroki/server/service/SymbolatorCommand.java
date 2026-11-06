package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.kroki.server.options.DiagramOption;
import io.vertx.core.json.JsonObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class SymbolatorCommand {

  private static final DiagramOption TRANSPARENT = DiagramOption.of("transparent");
  private static final DiagramOption TITLE = DiagramOption.of("title");
  private static final DiagramOption SCALE = DiagramOption.of("scale");
  private static final DiagramOption COMPONENT = DiagramOption.of("component");
  private static final DiagramOption NO_TYPE = DiagramOption.of("no-type");
  private static final DiagramOption LIBRARY_NAME = DiagramOption.of("library-name");

  private final String binPath;
  private final Commander commander;

  public SymbolatorCommand(JsonObject config) {
    this.binPath = config.getString("KROKI_SYMBOLATOR_BIN_PATH", "symbolator");
    this.commander = new Commander(config);
  }

  public List<DiagramOption> geOptions() {
    return List.of(TRANSPARENT, TITLE, SCALE, COMPONENT, NO_TYPE, LIBRARY_NAME);
  }

  public byte[] convert(String source, FileFormat format, JsonObject options) throws IOException, InterruptedException {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    // Set input to stdin
    commands.add("--input");
    commands.add("-");
    // Set output to stdout
    commands.add("--output");
    commands.add("/dev/stdout");
    // If this is not set --output is treated as a directory
    commands.add("--output-as-filename");
    // ## Some notes on how symbolator selects a output format
    //
    // Format does not actually set the format but just the backend
    // If format is svg the svg backend is used. In this case the output is always svg
    //
    // If format is unset or not svg the cairo backend is used. In this case the format depends on the output file extension. svg, pdf and eps use the cairo backends for their filetypes. Every other extension will be a png.
    // Because of this `--output-as-filename --output file.svg --format svg` will create a different looking svg file from just `--output-as-filename --output file.svg`
    // We cant change the filename because we want the file in stdout. Maybe we could create a symlink with the correct extension to stdout and use that as the filename?
    //
    // The current behaviour will produce a slightly different image depending on the format. This may even be considered a feature.
    // It would be nice to also have a way to get a svg from cairo.
    // We currently cannot output pdf and eps because we cant change the extension.
    commands.add("--format");
    commands.add(format.getName());
    // Use a transparent background instead of white
    if (TRANSPARENT.isEnabled(options)) {
      commands.add("--transparent");
    }
    // If set this title will be inserted into the diagram
    String title = TITLE.get(options);
    if (title != null) {
      commands.add("--title");
      commands.add(title);
    }
    // Select the scale of the diagram. The default is 1.0.
    String scale = SCALE.get(options);
    if (scale != null) {
      commands.add("--scale");
      commands.add(scale);
    }
    // Select which component to render. The default is the last one I think.
    String component = COMPONENT.get(options);
    if (component != null) {
      commands.add("--component");
      commands.add(component);
    }
    if (NO_TYPE.isEnabled(options)) {
      commands.add("--no-type");
    }
    String libname = LIBRARY_NAME.get(options);
    if (libname != null) {
      commands.add("--libname ");
      commands.add(libname);
    }
    return commander.execute(source.getBytes(), commands.toArray(new String[0]));
  }
}
