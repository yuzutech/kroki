package io.kroki.server.transform;

import io.kroki.server.format.FileFormat;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

/**
 * Optional SVG theme delivery for Kroki responses.
 *
 * <p>Default remains fixed-color SVG from each diagram engine. When callers opt in
 * via {@code diagram_options.svg-theme} / query {@code svg-theme} /
 * header {@code Kroki-Diagram-Options-Svg-Theme}, Kroki can rewrite SVG toward
 * Themed SVG delivery modes:</p>
 *
 * <ul>
 *   <li>{@code adaptive} — standalone-adaptive ({@code prefers-color-scheme} dual palette)</li>
 *   <li>{@code host} — CSS custom properties with concrete fallbacks (manual site toggles)</li>
 *   <li>{@code fixed} / omitted — unchanged engine output</li>
 * </ul>
 *
 * <p>This class is the shared post-process hook. Full semantic-token binding is
 * diagram-type specific; engines that emit Themed SVG natively (e.g. Mermaid
 * {@code cssVariableTheme}) should pass through. Community polyfills until then:
 * https://github.com/dev-centr/mermaid-svg-css-vars and
 * https://github.com/dev-centr/plantuml-svg-css-vars</p>
 *
 * @see <a href="https://github.com/dev-centr/themed-svg/blob/main/proposals/2026-09-15-generator-kroki-themed-svg.md">RFC</a>
 * @see <a href="https://github.com/yuzutech/kroki/issues/2146">Kroki #2146</a>
 */
public final class ThemedSvgPostProcessor {

  public static final String OPTION_KEY = "svg-theme";

  public enum Mode {
    FIXED,
    ADAPTIVE,
    HOST;

    public static Mode fromOption(String raw) {
      if (raw == null || raw.isBlank()) {
        return FIXED;
      }
      return switch (raw.trim().toLowerCase()) {
        case "adaptive", "standalone-adaptive" -> ADAPTIVE;
        case "host" -> HOST;
        case "fixed", "none", "off", "false" -> FIXED;
        default -> FIXED;
      };
    }
  }

  private ThemedSvgPostProcessor() {
  }

  public static Buffer maybeApply(String serviceName, FileFormat fileFormat, JsonObject options, Buffer diagram) {
    if (fileFormat != FileFormat.SVG || diagram == null) {
      return diagram;
    }
    Mode mode = Mode.fromOption(options == null ? null : options.getString(OPTION_KEY));
    if (mode == Mode.FIXED) {
      return diagram;
    }
    String svg = diagram.toString();
    String transformed = switch (mode) {
      case ADAPTIVE -> toStandaloneAdaptive(serviceName, svg);
      case HOST -> toHost(serviceName, svg);
      default -> svg;
    };
    return Buffer.buffer(transformed);
  }

  /**
   * Minimal, safe host-mode rewrite: mark the root and document the intended
   * custom-property namespace. Engine-native CSS vars (Mermaid) should already
   * be present; this keeps the hook concrete without scraping colors.
   */
  static String toHost(String serviceName, String svg) {
    if (svg.contains("data-kroki-svg-theme=\"host\"")) {
      return svg;
    }
    return injectRootAttributes(svg,
      "data-kroki-svg-theme=\"host\" data-kroki-service=\"" + escapeAttr(serviceName) + "\"");
  }

  /**
   * Minimal adaptive wrapper: ensure a root stylesheet hook exists so consumers
   * and future engine-native dual palettes have a stable attachment point.
   * Full light/dark token rewriting remains engine-specific (polyfills today).
   */
  static String toStandaloneAdaptive(String serviceName, String svg) {
    if (svg.contains("data-kroki-svg-theme=\"adaptive\"")) {
      return svg;
    }
    String marked = injectRootAttributes(svg,
      "data-kroki-svg-theme=\"adaptive\" data-kroki-service=\"" + escapeAttr(serviceName) + "\"");
    if (marked.contains("prefers-color-scheme")) {
      return marked;
    }
    // Stable comment + empty media query scaffold; engines/polyfills fill tokens.
    String scaffold = "<style type=\"text/css\" id=\"kroki-svg-theme-adaptive\">"
      + "/* Kroki svg-theme=adaptive scaffold. Prefer engine-native dual palettes. */"
      + "@media (prefers-color-scheme: dark){/* token overrides */}"
      + "</style>";
    int insertAt = marked.indexOf('>');
    if (insertAt < 0) {
      return marked;
    }
    return marked.substring(0, insertAt + 1) + scaffold + marked.substring(insertAt + 1);
  }

  private static String injectRootAttributes(String svg, String attrs) {
    int svgOpen = svg.indexOf("<svg");
    if (svgOpen < 0) {
      return svg;
    }
    int tagEnd = svg.indexOf('>', svgOpen);
    if (tagEnd < 0) {
      return svg;
    }
    String openTag = svg.substring(svgOpen, tagEnd);
    if (openTag.contains("data-kroki-svg-theme=")) {
      return svg;
    }
    return svg.substring(0, tagEnd) + " " + attrs + svg.substring(tagEnd);
  }

  private static String escapeAttr(String value) {
    if (value == null) {
      return "";
    }
    return value.replace("\"", "&quot;");
  }
}
