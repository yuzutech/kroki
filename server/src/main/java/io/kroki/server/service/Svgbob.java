package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.option.DiagramOption;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Svgbob implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Collections.singletonList(FileFormat.SVG);
  private static final DiagramOption BACKGROUND = DiagramOption.value("background", "Background color, specified as a color value.");
  private static final DiagramOption FILL_COLOR = DiagramOption.value("fill-color", "Fill color for rendered shapes.");
  private static final DiagramOption FONT_FAMILY = DiagramOption.value("font-family", "Font family used for rendered text.");
  private static final DiagramOption FONT_SIZE = DiagramOption.value("font-size", "Font size used for rendered text.");
  private static final DiagramOption SCALE = DiagramOption.value("scale", "Scale factor for the rendered diagram.");
  private static final DiagramOption STROKE_WIDTH = DiagramOption.value("stroke-width", "Width of lines in the rendered diagram.");

  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;
  private final Commander commander;

  public Svgbob(Vertx vertx, JsonObject config, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_SVGBOB_BIN_PATH", "svgbob");
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded, false);
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
    // renovate: datasource=crate depName=svgbob_cli
    return "0.7.6";
  }

  @Override
  public List<DiagramOption> getOptions() {
    return List.of(BACKGROUND, FILL_COLOR, FONT_FAMILY, FONT_SIZE, SCALE, STROKE_WIDTH);
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    return vertx.executeBlocking(() -> {
      byte[] result = svgbob(sourceDecoded.getBytes(), options);
      return Buffer.buffer(result);
    });
  }

  private byte[] svgbob(byte[] source, JsonObject options) throws IOException, InterruptedException, IllegalStateException {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    getOptions().forEach(diagramOption -> addOption(diagramOption, options, commands));
    String[] args = commands.toArray(new String[0]);
    return commander.execute(source, args);
  }

  private void addOption(DiagramOption diagramOption, JsonObject options, List<String> commands) {
    String value = diagramOption.get(options);
    if (value != null) {
      String safeValue = value.replaceAll("[-\"$/@*&=;:!\\\\]", "");
      // No need to quote safeValue: ProcessBuilder passes arguments directly to the OS without shell interpretation.
      commands.add("--" + diagramOption.name() + "=" + safeValue);
    }
  }
}
