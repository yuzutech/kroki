package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.security.SafeMode;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Lini implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Collections.singletonList(FileFormat.SVG);

  private final Vertx vertx;
  private final String binPath;
  private final SafeMode safeMode;
  private final SourceDecoder sourceDecoder;
  private final Commander commander;

  public Lini(Vertx vertx, JsonObject config, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_LINI_BIN_PATH", "lini");
    this.safeMode = SafeMode.get(config.getString("KROKI_SAFE_MODE", "secure"), SafeMode.SECURE);
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
    return "1.1.0";
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    return vertx.executeBlocking(() -> {
      byte[] result = lini(sourceDecoded.getBytes(), options);
      return Buffer.buffer(result);
    });
  }

  private byte[] lini(byte[] source, JsonObject options) throws IOException, InterruptedException, IllegalStateException {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    commands.add("-"); // read from stdin
    if (safeMode != SafeMode.UNSAFE) {
      // An image node may point at a local path, which lini would otherwise read and embed in the output.
      // --no-fs refuses every local path (only URLs and data: URIs remain) and limits --theme to the built-in themes.
      commands.add("--no-fs");
    }
    String theme = options.getString("theme");
    if (theme != null) {
      // One argument, so a value starting with '-' is never read as a flag.
      commands.add("--theme=" + theme);
    }
    String staticMode = options.getString("static");
    if (staticMode != null) {
      commands.add("--static");
    }
    return commander.execute(source, commands.toArray(new String[0]));
  }
}
