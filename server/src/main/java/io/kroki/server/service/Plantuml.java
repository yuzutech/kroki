package io.kroki.server.service;

import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.response.Caching;
import io.kroki.server.response.DiagramResponse;
import io.kroki.server.security.SafeMode;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import net.sourceforge.plantuml.BlockUml;
import net.sourceforge.plantuml.ErrorUml;
import net.sourceforge.plantuml.FileFormatOption;
import net.sourceforge.plantuml.LineLocation;
import net.sourceforge.plantuml.OptionFlags;
import net.sourceforge.plantuml.SourceStringReader;
import net.sourceforge.plantuml.code.Base64Coder;
import net.sourceforge.plantuml.core.Diagram;
import net.sourceforge.plantuml.error.PSystemError;
import net.sourceforge.plantuml.version.Version;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;
import java.util.stream.Stream;

public class Plantuml implements DiagramService {

  /**
   * Extracts the target of the include/includeurl/includesub directive.
   * he first and only matching group is the target.
   * <p/>
   * We ignore any subpart/sub-document identifiers, i.e. anything after a {@code !} in the include name
   * <p/>
   * We ignore any trailing comments on the line, i.e. anything after a {@code #} in the include line
   * <p/>
   * The path should contain any character except a space (unless the space is escaped).
   * <p/>
   * Some sample patterns:
   * <ul>
   *   <li>{@code !include &lt;some/stdlib&gt;} includes a file from the stdlib</li>
   *   <li>{@code !include http://some/url} includes an external resource by URL</li>
   *   <li>{@code !include /absolute/file/path} includes a file from the filesystem</li>
   *   <li>{@code !include search-path-file} includes a file on the "plantuml.include.path"</li>
   *   <li>{@code !include search-path-file!2} includes the 3rd document in a file on the "plantuml.include.path"</li>
   *   <li>{@code !includesub search-path-file!SUBID} includes the SUBID subpart of a file on the "plantuml.include.path"</li>
   *   <li>{@code !includeurl http://some/url} deprecated include of an external resource by URL</li>
   *   <li>{@code !include /some/path\ with\ spaces} an absolute path with escaped spaces</li>
   *   <li>{@code !include /absolute/file/path # home directory} an absolute path with a trailing comment (#)</li>
   * </ul>
   *
   * @see <a href="https://plantuml.com/preprocessing">PlantUML Preprocessing</a>
   */
  public static final Pattern INCLUDE_RX = Pattern.compile("^\\s*!include(?:url|sub)?\\s+(?<path>(?:(?<=\\\\)[ ]|[^ ])+)(.*)");

  private static final Logger logger = LoggerFactory.getLogger(Plantuml.class);
  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG, FileFormat.BASE64, FileFormat.TXT, FileFormat.UTXT);
  private static final Pattern STDLIB_PATH_RX = Pattern.compile("<([a-zA-Z0-9]+)/[^>]+>");

  private final SafeMode safeMode;
  private final SourceDecoder sourceDecoder;
  private final DiagramResponse diagramResponse;
  private final List<Pattern> includeWhitelist;
  private static final List<String> STDLIB = Arrays.asList(
    "aws",
    "awslib",
    "azure",
    "c4",
    "cloudinsight",
    "cloudogu",
    "kubernetes",
    "material",
    "office",
    "osa",
    "tupadr3");

  public Plantuml(JsonObject config) {
    this.safeMode = SafeMode.get(config.getString("KROKI_SAFE_MODE", "secure"), SafeMode.SECURE);
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.plantumlDecode(encoded);
      }
    };
    this.diagramResponse = new DiagramResponse(new Caching(Version.etag()));
    this.includeWhitelist = parseIncludeWhitelist(config);
    // Disable unsafe include for security reasons
    OptionFlags.ALLOW_INCLUDE = config.getBoolean("KROKI_PLANTUML_ALLOW_INCLUDE", false);
    String plantUmlIncludePath = config.getString("KROKI_PLANTUML_INCLUDE_PATH");
    if (plantUmlIncludePath != null) {
      System.setProperty("plantuml.include.path", plantUmlIncludePath);
    }
  }

  static List<Pattern> parseIncludeWhitelist(JsonObject config) {
    String filename = config.getString("KROKI_PLANTUML_INCLUDE_WHITELIST");
    List<Pattern> result = new ArrayList<>();
    if (filename != null) {
      final Path path = Paths.get(filename);
      if (Files.isRegularFile(path)) {
        try {
          Files.lines(path).map(String::trim).filter(s -> !s.isEmpty()).flatMap(regex -> {
            try {
              return Stream.of(Pattern.compile(regex));
            } catch (PatternSyntaxException e) {
              logger.warn("Ignoring invalid regex '{}' in '{}'", regex, filename, e);
              return Stream.empty();
            }
          }).forEach(result::add);
        } catch (IOException e) {
          logger.warn("Unable to read the PlantUML whitelist file '{}'", filename, e);
          return Collections.emptyList();
        }
      } else {
        logger.warn("Unable to read the PlantUML whitelist file '{}' as it is not a regular file", filename);
      }
    }
    for (int i = 0; true; i++) {
      final String regex = config.getString("KROKI_PLANTUML_INCLUDE_WHITELIST_" + i);
      if (regex == null || regex.trim().isEmpty()) {
        // stop at the first missing index
        break;
      }
      try {
        result.add(Pattern.compile(regex.trim()));
      } catch (PatternSyntaxException e) {
        logger.warn("Ignoring invalid regex '{}' from KROKI_PLANTUML_INCLUDE_WHITELIST_{}", regex.trim(), i, e);
      }
    }
    return result;
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
  public void convert(RoutingContext routingContext, String sourceDecoded, String serviceName, FileFormat fileFormat) {
    HttpServerResponse response = routingContext.response();
    String source;
    try {
      source = sanitize(sourceDecoded, this.safeMode, this.includeWhitelist);
      source = withDelimiter(source);
    } catch (IOException e) {
      if (e instanceof UnsupportedEncodingException) {
        routingContext.fail(new BadRequestException("Characters must be encoded in UTF-8.", e));
      } else {
        routingContext.fail(e);
      }
      return;
    }
    byte[] data = convert(source, fileFormat);
    diagramResponse.end(response, sourceDecoded, fileFormat, data);
  }

  static byte[] convert(String source, FileFormat format) {
    try {
      SourceStringReader reader = new SourceStringReader(source);
      if (format == FileFormat.BASE64) {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream();
        reader.outputImage(baos, 0, new FileFormatOption(FileFormat.PNG.toPlantumlFileFormat()));
        baos.close();
        final String encodedBytes = "data:image/png;base64,"
          + Base64Coder.encodeLines(baos.toByteArray()).replaceAll("\\s", "");
        return encodedBytes.getBytes();
      }
      if (reader.getBlocks().isEmpty()) {
        throw new BadRequestException("Empty diagram, missing delimiters?");
      }
      final BlockUml blockUml = reader.getBlocks().get(0);
      final Diagram diagram = blockUml.getDiagram();
      if (diagram instanceof PSystemError) {
        Collection<ErrorUml> errors = ((PSystemError) diagram).getErrorsUml();
        if (!errors.isEmpty()) {
          ErrorUml errorUml = errors.iterator().next();
          LineLocation lineLocation = errorUml.getLineLocation();
          String lineLocationPosition = "";
          if (lineLocation != null) {
            lineLocationPosition = " (line: " + lineLocation.getPosition() + ")";
          }
          throw new BadRequestException(errorUml.getError() + lineLocationPosition);
        }
        throw new BadRequestException("Unable to convert the diagram");
      }
      ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
      diagram.exportDiagram(byteArrayOutputStream, 0, new FileFormatOption(format.toPlantumlFileFormat()));
      return byteArrayOutputStream.toByteArray();
    } catch (IOException e) {
      throw new RuntimeException("Bad request", e);
    }
  }

  static String withDelimiter(String source) {
    String result;
    if (source.startsWith("@start")) {
      result = source;
    } else {
      StringBuilder plantUmlSource = new StringBuilder();
      plantUmlSource.append("@startuml\n");
      plantUmlSource.append(source);
      if (!source.endsWith("\n")) {
        plantUmlSource.append("\n");
      }
      plantUmlSource.append("@enduml");
      result = plantUmlSource.toString();
    }
    return result;
  }

  static String sanitize(String input, SafeMode safeMode) throws IOException {
    return sanitize(input, safeMode, Collections.emptySet());
  }

  static String sanitize(String input, SafeMode safeMode, Collection<Pattern> includeWhitelist) throws IOException {
    if (safeMode == SafeMode.UNSAFE) {
      return input;
    }
    try (BufferedReader reader = new BufferedReader(new StringReader(input))) {
      StringBuilder sb = new StringBuilder();
      String line = reader.readLine();
      while (line != null) {
        ignoreInclude(line, sb, safeMode, includeWhitelist);
        line = reader.readLine();
      }
      return sb.toString();
    }
  }

  private static void ignoreInclude(String line, StringBuilder sb, SafeMode safeMode, Collection<Pattern> includeWhitelist) {
    Matcher matcher = INCLUDE_RX.matcher(line);
    if (matcher.matches()) {
      String include = matcher.group("path").trim();
      Matcher stdlibPathMatcher = STDLIB_PATH_RX.matcher(include);
      if (stdlibPathMatcher.matches()) {
        String prefix = stdlibPathMatcher.group(1).toLowerCase();
        if (STDLIB.contains(prefix)) {
          sb.append(line).append("\n");
        }
      } else if (safeMode.value < SafeMode.SECURE.value) {
        if (!include.startsWith("<") // includes starting with < must only come from stdlib
          && !include.startsWith("/") && !include.startsWith("\\") // no absolute paths,
          && !include.startsWith("http://") && !include.startsWith("https://") // no URLs
          // no path walking
          && !include.startsWith("../") && !include.contains("/../") && !include.endsWith("/..")
          && !include.startsWith("..\\") && !include.contains("\\..\\") && !include.endsWith("\\..")
          && !include.contains("/..\\") && !include.contains("\\../")) {
          // PlantUML's safety checking will suffice as it will only allow files directly in the include path

          // Note: we are relying on the PlantUML include checking algorithm:
          // * See ImportedFiles#executeInclude and ImportedFiles#executeIncludesub
          // * !importsub does not work with URLs or the standard library
          // * Imports that start with `http://` or `https://` are resolved from the URL, that is generally
          //   unsafe unless you can trust the source of the URL, thus we do not permit here.
          // * Imports wrapped in `<` and `>` are resolved only from the standard library and thus should be
          //   a fixed set guarded by `/stdlib/${name}-abx.repx` resources on the classpath, in any case we
          //   ignore stdlib import validation here
          // * Absolute imports could refer to any file, so we exclude those, though FileWithSuffix#fileOk()
          //   should restrict accessible files to only those "approved"
          // * We only auto-permit "search path" includes that do not attempt search path escaping with `..`
          // * The import or importsub that we auto-permit will result in a call to ImportedFiles.getFile(...)
          // * That will iterate the "plantuml.include.path" (note PlantUML is not well designed for embedding
          //   on this property as the ImportedFiles#INCLUDE_PATH is initialized once on classloading)
          // * At this point, if the INCLUDE_PATH included say `/example` and the include was `foo/bar.puml`
          //   and there is a file `/example/foo/bar.puml` then that would stop the search with an `AFileRegular`
          //   instance. HOWEVER, the return value of ImportedFiles#getFile is guarded by ImportedFiles#isAllowed
          // * ImportedFiles#isAllowed will only permit AFile instances with the AFile#getSystemFolder() being
          //   contained in ImportedFiles#INCLUDE_PATH so as AFileRegular#getSystemFolder() always returned the
          //   parent folder of the file and include of `foo/bar.puml` found on an include path of `/example`
          //   resolving to `/example/foo/bar.puml` will have a system folder of `/example/foo` which is not
          //   one of the folders whitelisted in the include path and thus the include will be resolved as not-found
          //
          // Effectively only imports that are immediate children of the folders listed in "plantuml.include.path"
          // are eligible for inlcude (unless OptionFlags.ALLOW_INCLUDE has been set to true)
          sb.append(line).append("\n");
        } else if (includeWhitelist.stream().anyMatch(p -> p.matcher(include).matches())) {
          sb.append(line).append("\n");
        }
      }
    } else {
      sb.append(line).append("\n");
    }
  }
}
