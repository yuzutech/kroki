package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MscGenerator implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.PDF);

  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;
  private final Commander commander;

  public MscGenerator(Vertx vertx, JsonObject config, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_MSCGEN_BIN_PATH", "msc-gen");
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
    try {
      Process process = new ProcessBuilder(binPath, "--version").start();
      String line = new BufferedReader(new InputStreamReader(process.getInputStream())).readLine();
      return line.split("\\s+")[1].substring(1);
    } catch (IOException e) {
      return "unknown";
    }
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        byte[] result = mscgen(sourceDecoded.getBytes(), fileFormat.getName(), options);
        future.complete(result);
      } catch (IOException | InterruptedException | IllegalStateException e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }

  private byte[] mscgen(byte[] source, String format, JsonObject options) throws IOException, InterruptedException, IllegalStateException {
    return commander.execute(
      source,
      binPath,
      "-S", options.getString("lang", "signalling"), // Supported languages: signalling | msc, graph, block
      "-T", format,
      "-s=" + options.getFloat("scale", 1.f),
      "-"
    );
  }
}
