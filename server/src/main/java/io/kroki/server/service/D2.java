package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static java.util.Map.entry;

public class D2 implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Collections.singletonList(FileFormat.SVG);
  private static final DiagramOption LAYOUT = DiagramOption.of("layout", "dagre", List.of("dagre", "elk", "tala"));
  private static final DiagramOption DARK_THEME = DiagramOption.of("dark-theme");
  private static final DiagramOption PAD = DiagramOption.of("pad");
  private static final DiagramOption ANIMATE_INTERVAL = DiagramOption.of("animate-interval");
  private static final DiagramOption SKETCH = DiagramOption.of("sketch");
  private static final DiagramOption SCALE = DiagramOption.of("scale");

  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;
  private final Commander commander;

  private final Map<String, Integer> builtinThemes = Map.ofEntries(
    entry("default", 0),
    entry("neutral-gray", 1),
    entry("flagship-terrastruct", 3),
    entry("cool-classics", 4),
    entry("mixed-berry-blue", 5),
    entry("grape-soda", 6),
    entry("aubergine", 7),
    entry("colorblind-clear", 8),
    entry("vanilla-nitro-cola", 100),
    entry("orange-creamsicle", 101),
    entry("shirley-temple", 102),
    entry("earth-tones", 103),
    entry("everglade-green", 104),
    entry("buttered-toast", 105),
    entry("dark-mauve", 200),
    entry("dark-flagship-terrastruct", 201),
    entry("terminal", 300),
    entry("terminal-grayscale", 301),
    entry("origami", 302),
    entry("c4", 303)
  );

  private final DiagramOption THEME = DiagramOption.of("theme", "default", new ArrayList<>(builtinThemes.keySet()));

  public D2(Vertx vertx, JsonObject config, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_D2_BIN_PATH", "d2");
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
    // renovate: datasource=github-releases depName=d2lang/d2 extractVersion=^v(?<version>.*)$
    return "0.9.0";
  }


  @Override
  public List<DiagramOption> geOptions() {
    return List.of(LAYOUT, THEME, DARK_THEME, PAD, ANIMATE_INTERVAL, SKETCH, SCALE);
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    return vertx.executeBlocking(() -> {
      byte[] result = d2(sourceDecoded.getBytes(), options);
      return Buffer.buffer(result);
    });
  }

  private byte[] d2(byte[] source, JsonObject options) throws IOException, InterruptedException, IllegalStateException {
    List<String> commands = new ArrayList<>();
    commands.add(binPath);
    String layout = LAYOUT.get(options);
    if ("elk".equals(layout) || "tala".equals(layout)) {
      // Only pass the layout argument if an alternate layout engine is requested (default is 'dagre'),
      // so that the layout engine selected in the diagram (`d2-config`) is not overridden
      commands.add("--layout=" + layout);
    }
    String theme = THEME.get(options);
    if (theme != null) {
      int themeId = 0;
      Integer builtinThemeId = builtinThemes.get(theme.toLowerCase().replaceAll("\\s", "-"));
      if (builtinThemeId != null) {
        themeId = builtinThemeId;
      } else {
        try {
          themeId = Integer.parseInt(theme, 10);
        } catch (NumberFormatException e) {
          // ignore, fallback to 0
        }
      }
      commands.add("--theme=" + themeId);
    }
    String darkTheme = DARK_THEME.get(options);
    if (darkTheme != null) {
      int themeId = 0;
      Integer builtinThemeId = builtinThemes.get(darkTheme.toLowerCase().replaceAll("\\s", "-"));
      if (builtinThemeId != null) {
        themeId = builtinThemeId;
      } else {
        try {
          themeId = Integer.parseInt(darkTheme, 10);
        } catch (NumberFormatException e) {
          // ignore, fallback to 0
        }
      }
      commands.add("--dark-theme=" + themeId);
    }
    String pad = PAD.get(options);
    if (pad != null) {
      commands.add("--pad=" + pad);
    }
    String animateInterval = ANIMATE_INTERVAL.get(options);
    if (animateInterval != null) {
      commands.add("--animate-interval=" + animateInterval);
    }
    if (SKETCH.isEnabled(options)) {
      commands.add("--sketch");
    }
    String scale = SCALE.get(options);
    if (scale != null) {
      commands.add("--scale=" + scale);
    }
    commands.add("-"); // read from stdin
    return commander.execute(source, commands.toArray(new String[0]));
  }
}
