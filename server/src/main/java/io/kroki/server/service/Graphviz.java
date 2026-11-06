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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Graphviz implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG, FileFormat.PDF);

  private static final String NODE_ATTRIBUTE_PREFIX = "node-attribute-";
  private static final String GRAPH_ATTRIBUTE_PREFIX = "graph-attribute-";
  private static final String EDGE_ATTRIBUTE_PREFIX = "edge-attribute-";
  private static final DiagramOption SCALE = DiagramOption.of("scale");
  private static final DiagramOption LAYOUT = DiagramOption.of("layout");
  private static final DiagramOption NODE_ATTRIBUTE = DiagramOption.prefix(NODE_ATTRIBUTE_PREFIX);
  private static final DiagramOption GRAPH_ATTRIBUTE = DiagramOption.prefix(GRAPH_ATTRIBUTE_PREFIX);
  private static final DiagramOption EDGE_ATTRIBUTE = DiagramOption.prefix(EDGE_ATTRIBUTE_PREFIX);

  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;
  private final Commander commander;

  public Graphviz(Vertx vertx, JsonObject config, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_DOT_BIN_PATH", "dot");
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
    // renovate: datasource=docker depName=ghcr.io/yuzutech/kroki-builder-graphviz
    return "14.1.3";
  }

  @Override
  public List<DiagramOption> geOptions() {
    return List.of(SCALE, LAYOUT, NODE_ATTRIBUTE, GRAPH_ATTRIBUTE, EDGE_ATTRIBUTE);
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    return vertx.executeBlocking(() -> {
      byte[] result = dot(sourceDecoded.getBytes(), fileFormat.getName(), options);
      return Buffer.buffer(result);
    });
  }

  private byte[] dot(byte[] source, String format, JsonObject options) throws IOException, InterruptedException, IllegalStateException {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    // Supported format:
    // canon cmap cmapx cmapx_np dot dot_json eps fig gd gd2 gif gv imap imap_np ismap
    // jpe jpeg jpg json json0 mp pdf pic plain plain-ext
    // png pov ps ps2
    // svg svgz tk vml vmlz vrml wbmp x11 xdot xdot1.2 xdot1.4 xdot_json xlib
    commands.add("-T" + format);
    String scale = SCALE.get(options);
    if (scale != null) {
      commands.add("-s" + scale);
    }
    String layout = LAYOUT.get(options);
    if (layout != null) {
      commands.add("-K" + layout);
    }
    for (String fieldName : options.fieldNames()) {
      if (fieldName.startsWith(NODE_ATTRIBUTE_PREFIX)) {
        String name = fieldName.replace(NODE_ATTRIBUTE_PREFIX, "");
        commands.add("-N" + name + "=" + options.getString(fieldName));
      }
      if (fieldName.startsWith(GRAPH_ATTRIBUTE_PREFIX)) {
        String name = fieldName.replace(GRAPH_ATTRIBUTE_PREFIX, "");
        commands.add("-G" + name + "=" + options.getString(fieldName));
      }
      if (fieldName.startsWith(EDGE_ATTRIBUTE_PREFIX)) {
        String name = fieldName.replace(EDGE_ATTRIBUTE_PREFIX, "");
        commands.add("-E" + name + "=" + options.getString(fieldName));
      }
    }
    return commander.execute(source, commands.toArray(new String[0]));
  }
}
