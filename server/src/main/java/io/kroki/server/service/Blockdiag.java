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
import java.util.Arrays;
import java.util.List;

public class Blockdiag implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.PDF);
  private static final DiagramOption ANTIALIAS = DiagramOption.flag("antialias", "Enable antialiasing.");
  private static final DiagramOption NO_TRANSPARENCY = DiagramOption.flag("no-transparency", "Use an opaque background.")
    .onlyFor(FileFormat.PNG);
  private static final DiagramOption SIZE = DiagramOption.value("size", "Image size, for instance 640x480.");
  private static final DiagramOption NO_DOCTYPE = DiagramOption.flag("no-doctype", "Omit the document type declaration from SVG output.")
    .onlyFor(FileFormat.SVG);

  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;
  private final Commander commander;

  public Blockdiag(Vertx vertx, JsonObject config, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_BLOCKDIAG_BIN_PATH", "blockdiag");
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
    // renovate: datasource=docker depName=ghcr.io/yuzutech/kroki-builder-blockdiag
    return "3.4.2";
  }

  @Override
  public List<DiagramOption> getOptions() {
    return List.of(ANTIALIAS, NO_TRANSPARENCY, SIZE, NO_DOCTYPE);
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    return vertx.executeBlocking(() -> {
      byte[] result = bin(sourceDecoded.getBytes(), serviceName, fileFormat, options);
      return Buffer.buffer(result);
    });
  }

  private byte[] bin(byte[] source, String serviceName, FileFormat fileFormat, JsonObject options) throws IOException, InterruptedException, IllegalStateException {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    commands.add("--module=" + serviceName);
    commands.add("--font=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf");
    commands.add("-T" + fileFormat.getName());
    if (ANTIALIAS.isEnabled(options)) {
      commands.add("--antialias");
    }
    if (fileFormat == FileFormat.PNG && NO_TRANSPARENCY.isEnabled(options)) {
      commands.add("--no-transparency");
    }
    String sizeValue = SIZE.get(options);
    if (sizeValue != null) {
      commands.add("--size=" + sizeValue);
    }
    if (fileFormat == FileFormat.SVG && NO_DOCTYPE.isEnabled(options)) {
      commands.add("--nodoctype");
    }
    commands.add("-"); // read from stdin
    return commander.execute(source, commands.toArray(new String[0]));
  }
}
