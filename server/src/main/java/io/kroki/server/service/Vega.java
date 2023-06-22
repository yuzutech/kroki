package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.security.SafeMode;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class Vega implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.SVG, FileFormat.PNG, FileFormat.PDF);
  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;
  private final SafeMode safeMode;
  private final Commander commander;
  private final SpecFormat specFormat;

  public Vega(Vertx vertx, JsonObject config, SpecFormat specFormat, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_VEGA_BIN_PATH", "vega");
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
    this.safeMode = SafeMode.get(config.getString("KROKI_SAFE_MODE", "secure"), SafeMode.SECURE);
    this.commander = commander;
    this.specFormat = specFormat;
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
    if (specFormat == SpecFormat.DEFAULT) {
      return "5.25.0";
    } else {
      return "5.9.3"; // Vega Lite
    }
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        byte[] result = vega(sourceDecoded.getBytes(), fileFormat.getName());
        future.complete(result);
      } catch (IOException | InterruptedException | IllegalStateException e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }

  private byte[] vega(byte[] source, String format) throws IOException, InterruptedException, IllegalStateException {
    String vegaSafeMode = safeMode == SafeMode.UNSAFE ? "unsafe" : "secure";
    return commander.execute(source, binPath,
      "--output-format=" + format,
      "--safe-mode=" + vegaSafeMode,
      "--spec-format=" + specFormat.name().toLowerCase());
  }

  public enum SpecFormat {
    DEFAULT,
    LITE;
  }
}
