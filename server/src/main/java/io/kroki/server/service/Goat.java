package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Goat implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.SVG);
  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;
  private final Commander commander;

  public Goat(Vertx vertx, JsonObject config, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_GOAT_BIN_PATH", "goat");
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
    return "0.5.1";
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    return vertx.executeBlocking(() -> {
      List<String> commands = new ArrayList<>();
      commands.add(binPath);

      String svgColorDarkScheme = options.getString("svg-color-dark-scheme");
      if (svgColorDarkScheme != null) {
        commands.add("-svg-color-dark-scheme");
        commands.add(svgColorDarkScheme);
      }

      String svgColorLightScheme = options.getString("svg-color-light-scheme");
      if (svgColorLightScheme != null) {
        commands.add("-svg-color-light-scheme");
        commands.add(svgColorLightScheme);
      }

      String utf8 = options.getString("utf8");
      if (utf8 != null) {
        commands.add("-utf8");
      }

      // TODO: Integrate `css` option.
      // Currently GoAT only supports passing custom CSS via files.
      // It would be best if we can inline it directly instead.

      byte[] result = commander.execute(sourceDecoded.getBytes(), commands.toArray(new String[0]));
      return Buffer.buffer(result);
    });
  }
}
