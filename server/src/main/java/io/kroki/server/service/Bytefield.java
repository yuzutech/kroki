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
   * bytefield-svg evaluates its (attacker-controlled) input with sci (a Clojure interpreter) running
   * on Node.js. The sci sandbox exposes {@code aget}/{@code aset}, which read and write arbitrary
   * properties on any reachable JavaScript object and bypass sci's method-authorization check. A
   * diagram reaches the host globals ({@code process}, {@code require}, ...) through one of two
   * bridges: code generation ({@code new Function}/{@code eval}), or V8 stack frames (it rebinds the
   * native {@code CallSite.getThis} as a property getter and walks {@code Error.prepareStackTrace}
   * -&gt; {@code CallSite[]} -&gt; a frame receiver that is the global object, then reaches
   * {@code child_process} for remote code execution). We defend in depth against both bridges:
   *
   * <ul>
   *   <li>{@code --disallow-code-generation-from-strings} makes the V8 context reject
   *   {@code new Function(...)} / {@code eval(...)}, closing the code-generation bridge. The
   *   bytefield binary also freezes {@code Error.prepareStackTrace} at startup, closing the stack
   *   bridge (see bytefield/index.js).</li>
   *   <li>{@code --permission} enables the Node.js Permission Model with no {@code --allow-*} flags,
   *   so even if diagram code still reaches {@code process} through some future bridge, spawning a
   *   child process, reading or writing the filesystem, and starting a worker all fail with
   *   {@code ERR_ACCESS_DENIED}. bytefield-svg only reads stdin and writes stdout, so no access
   *   needs to be granted. This is a capability bound that does not depend on the escape technique.</li>
   * </ul>
   *
   * Both flags must be set at process startup (via NODE_OPTIONS), as they only apply when the V8
   * context / process is created; toggling them at runtime from inside the script has no effect.
   * They are scoped to this process so other Node-based services (e.g. Vega, which legitimately
   * compiles expressions to functions) are not impacted.
   */
  private static final String DISALLOW_CODE_GENERATION_FLAG = "--disallow-code-generation-from-strings";
  private static final String PERMISSION_FLAG = "--permission";
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
    return "1.12.0";
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
    String flags = DISALLOW_CODE_GENERATION_FLAG + " " + PERMISSION_FLAG;
    String value;
    if (existing == null || existing.isBlank()) {
      value = flags;
    } else {
      value = existing + " " + flags;
    }
    return Map.of("NODE_OPTIONS", value);
  }
}
