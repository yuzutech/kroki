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
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class Bytefield implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Collections.singletonList(FileFormat.SVG);
  /**
   * bytefield-svg evaluates its input with sci (a Clojure interpreter) running on Node.js. The sci
   * sandbox exposes {@code aget}, which allows traversing the prototype chain from a string literal
   * up to the {@code Function} constructor and evaluating arbitrary JavaScript (remote code
   * execution). Running the process with {@code --disallow-code-generation-from-strings} makes the
   * V8 context reject {@code new Function(...)} / {@code eval(...)}, which neutralizes that escape
   * while leaving legitimate diagrams unaffected. The flag must be set at process startup (via
   * NODE_OPTIONS), as it only applies when the V8 context is created; toggling it at runtime from
   * inside the script has no effect. It is scoped to this process so other Node-based services
   * (e.g. Vega, which legitimately compiles expressions to functions) are not impacted.
   */
  private static final String DISALLOW_CODE_GENERATION_FLAG = "--disallow-code-generation-from-strings";
  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;
  private final Commander commander;

  public Bytefield(Vertx vertx, JsonObject config, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_BYTEFIELD_BIN_PATH", "bytefield-svg");
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
    // renovate: datasource=npm depName=bytefield-svg
    return "1.11.0";
  }

  @Override
  public List<DiagramOption> getOptions() {
    return List.of();
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    return vertx.executeBlocking(() -> {
      byte[] result = bytefield(sourceDecoded.getBytes());
      return Buffer.buffer(result);
    });
  }

  private byte[] bytefield(byte[] source) throws IOException, InterruptedException, IllegalStateException {
    return commander.execute(source, nodeOptionsEnvironment(), binPath);
  }

  private static Map<String, String> nodeOptionsEnvironment() {
    String existing = System.getenv("NODE_OPTIONS");
    String value;
    if (existing == null || existing.isBlank()) {
      value = DISALLOW_CODE_GENERATION_FLAG;
    } else {
      value = existing + " " + DISALLOW_CODE_GENERATION_FLAG;
    }
    return Map.of("NODE_OPTIONS", value);
  }
}
