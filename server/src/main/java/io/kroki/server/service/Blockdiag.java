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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Blockdiag implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.PDF);

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
    return "3.1.0";
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        byte[] result = bin(sourceDecoded.getBytes(), serviceName, fileFormat, options);
        future.complete(result);
      } catch (IOException | InterruptedException | IllegalStateException e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }

  private byte[] bin(byte[] source, String serviceName, FileFormat fileFormat, JsonObject options) throws IOException, InterruptedException, IllegalStateException {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    commands.add("--module=" + serviceName);
    commands.add("--font=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf");
    commands.add("-T" + fileFormat.getName());
    String antialiasValue = options.getString("antialias");
    if (antialiasValue != null) {
      commands.add("--antialias");
    }
    String noTransparencyValue = options.getString("no-transparency");
    if (fileFormat == FileFormat.PNG && noTransparencyValue != null) {
      commands.add("--no-transparency");
    }
    String sizeValue = options.getString("size");
    if (sizeValue != null) {
      commands.add("--size=" + sizeValue);
    }
    String noDoctypeValue = options.getString("no-doctype");
    if (fileFormat == FileFormat.SVG && noDoctypeValue != null) {
      commands.add("--nodoctype");
    }
    commands.add("-"); // read from stdin
    return commander.execute(source, commands.toArray(new String[0]));
  }
}
