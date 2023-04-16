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
import java.util.Collections;
import java.util.List;

public class Svgbob implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Collections.singletonList(FileFormat.SVG);

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
    return "0.7.0";
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    vertx.executeBlocking(future -> {
      try {
        byte[] result = svgbob(sourceDecoded.getBytes(), options);
        future.complete(result);
      } catch (IOException | InterruptedException | IllegalStateException e) {
        future.fail(e);
      }
    }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
  }

  private byte[] svgbob(byte[] source, JsonObject options) throws IOException, InterruptedException, IllegalStateException {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    addOption("background", options, commands);
    addOption("fill-color", options, commands);
    addOption("font-family", options, commands);
    addOption("font-size", options, commands);
    addOption("scale", options, commands);
    addOption("stroke-width", options, commands);
    return commander.execute(source, commands.toArray(new String[0]));
  }

  private void addOption(String optionKey, JsonObject options, List<String> commands) {
    String value = options.getString(optionKey);
    if (value != null) {
      String safeValue = value.replaceAll("[-\"$/@*&=;:!\\\\]", "");
      commands.add("--" + optionKey + "=\"" + safeValue + "\"");
    }
  }
}
