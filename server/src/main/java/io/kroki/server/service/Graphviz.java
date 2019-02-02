package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class Graphviz implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG);

  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;

  public Graphviz(Vertx vertx, JsonObject config) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_DOT_BIN_PATH", "dot");
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
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
  public void convert(RoutingContext routingContext, String sourceDecoded, FileFormat fileFormat) {
    HttpServerResponse response = routingContext.response();
    vertx.executeBlocking(future -> {
      try {
        byte[] result = dot(sourceDecoded.getBytes(), fileFormat.getName());
        future.complete(result);
      } catch (IOException | InterruptedException | IllegalStateException e) {
        future.fail(e);
      }
    }, res -> {
      if (res.failed()) {
        routingContext.fail(res.cause());
        return;
      }
      byte[] result = (byte[]) res.result();
      response
        .putHeader("Content-Type", ContentType.get(fileFormat))
        .end(Buffer.buffer(result));
    });
  }

  private byte[] dot(byte[] source, String format) throws IOException, InterruptedException, IllegalStateException {
    // Supported format:
    // canon cmap cmapx cmapx_np dot dot_json eps fig gd gd2 gif gv imap imap_np ismap
    // jpe jpeg jpg json json0 mp pdf pic plain plain-ext
    // png pov ps ps2
    // svg svgz tk vml vmlz vrml wbmp x11 xdot xdot1.2 xdot1.4 xdot_json xlib
    return Commander.execute(source, binPath, "-T" + format);
  }
}
