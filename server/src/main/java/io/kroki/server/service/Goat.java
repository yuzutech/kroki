package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class Goat implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.SVG);
  // GoAT interpolates the color options as-is into a <style> element of the SVG.
  // Only allow the characters needed by CSS colors (named colors, hex notation,
  // rgb()/hsl()/... functions) so that a value cannot break out of the CSS rule
  // or the <style> element.
  private static final Pattern CSS_COLOR = Pattern.compile("[#a-zA-Z0-9(),.%/ -]{1,64}");
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
        // GoAT renders ASCII art on a character grid, so leading whitespace is
        // significant. Decode without trimming to preserve the indentation of
        // the first line (see Svgbob, Ditaa).
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
    return "0.5.1";
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    return vertx.executeBlocking(() -> {
      List<String> commands = new ArrayList<>();
      commands.add(binPath);

      addColorOption(commands, options, "svg-color-dark-scheme");
      addColorOption(commands, options, "svg-color-light-scheme");

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

  private static void addColorOption(List<String> commands, JsonObject options, String name) {
    String value = options.getString(name);
    if (value == null) {
      return;
    }
    if (!isValidColor(value)) {
      throw new BadRequestException("Invalid value for option " + name + ": must be a CSS color (for instance: #FFF, red or rgb(0, 0, 0)).");
    }
    commands.add("-" + name);
    commands.add(value);
  }

  static boolean isValidColor(String value) {
    return CSS_COLOR.matcher(value).matches();
  }
}
