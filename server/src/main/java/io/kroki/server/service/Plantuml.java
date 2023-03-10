package io.kroki.server.service;

import io.kroki.server.action.Delegator;
import io.kroki.server.action.DitaaContext;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.log.Logging;
import io.kroki.server.security.SafeMode;
import io.kroki.server.unit.TimeValue;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
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
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
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
import java.util.stream.Collectors;
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
  private static final Pattern STARTDITAA_BLOCK_RX = Pattern.compile("(?:^| +)@startditaa(?<opts>\\s\\S*)\\n(?<source>.*?) *@endditaa", Pattern.MULTILINE | Pattern.DOTALL);
  private static final Pattern DITAA_KEYWORD_BOCK_RX = Pattern.compile("@startuml(:?\\s*)(?:^| +)ditaa(?:(?:\\((?<opts>[^)]*)\\))?| *)\\n(?<source>.*?) *@end(?:ditaa|uml)", Pattern.MULTILINE | Pattern.DOTALL);
  private static final Pattern START_BLOCK_RX = Pattern.compile("^(@start.*\\n)");

  private static final Logger logger = LoggerFactory.getLogger(Plantuml.class);
  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG, FileFormat.BASE64, FileFormat.TXT, FileFormat.UTXT);
  private static final Pattern STDLIB_PATH_RX = Pattern.compile("<([a-zA-Z0-9]+)/[^>]+>");

  private final Vertx vertx;
  private final SafeMode safeMode;
  private final Logging logging;
  private static final String c4 = read("c4.puml");
  // context includes c4
  private static final String c4Context = c4 + read("c4_context.puml");
  // container includes context
  private static final String c4Container = c4Context + read("c4_container.puml");
  // component includes container
  private static final String c4Component = c4Container + read("c4_component.puml");
  // deployment includes container
  private static final String c4Deployment = c4Container + read("c4_deployment.puml");
  // dynamic includes component
  private static final String c4Dynamic = c4Component + read("c4_dynamic.puml");
  private final SourceDecoder sourceDecoder;
  private final List<Pattern> includeWhitelist;
  private static final List<String> STDLIB = Arrays.asList(
    "archimate",
    "aws",
    "awslib",
    "azure",
    "c4",
    "classy",
    "cloudinsight",
    "cloudogu",
    "domainstory",
    "elastic",
    "kubernetes",
    "logos",
    "material",
    "office",
    "osa",
    "tupadr3");

  public Plantuml(Vertx vertx, JsonObject config) {
    this.vertx = vertx;
    this.safeMode = SafeMode.get(config.getString("KROKI_SAFE_MODE", "secure"), SafeMode.SECURE);
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.plantumlDecode(encoded);
      }
    };
    this.includeWhitelist = parseIncludeWhitelist(config);
    this.logging = new Logging(logger);
    // Disable unsafe include for security reasons
    OptionFlags.ALLOW_INCLUDE = config.getBoolean("KROKI_PLANTUML_ALLOW_INCLUDE", false);
    String plantUmlIncludePath = config.getString("KROKI_PLANTUML_INCLUDE_PATH");
    if (plantUmlIncludePath != null) {
      System.setProperty("plantuml.include.path", plantUmlIncludePath);
    }
    TimeValue convertTimeout;
    if (config.containsKey("KROKI_PLANTUML_CONVERT_TIMEOUT")) {
      String convertPlantumlTimeoutValue = config.getString("KROKI_PLANTUML_CONVERT_TIMEOUT", "20s");
      convertTimeout = TimeValue.parseTimeValue(convertPlantumlTimeoutValue, "KROKI_PLANTUML_CONVERT_TIMEOUT");
    } else {
      String convertTimeoutValue = config.getString("KROKI_CONVERT_TIMEOUT", "20s");
      convertTimeout = TimeValue.parseTimeValue(convertTimeoutValue, "KROKI_CONVERT_TIMEOUT");
    }
    OptionFlags.getInstance().setTimeoutMs(convertTimeout.millis());
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
  public String getVersion() {
    return Version.versionString();
  }

  @Override
  public void convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options, Handler<AsyncResult<Buffer>> handler) {
    String source;
    try {
      source = sanitize(sourceDecoded, this.safeMode, this.includeWhitelist);
      source = source.trim();
      source = withDelimiter(source);
    } catch (IOException e) {
      if (e instanceof UnsupportedEncodingException) {
        handler.handle(new Delegator.Failure(new BadRequestException("Characters must be encoded in UTF-8.", e)));
      } else {
        handler.handle(new Delegator.Failure(e));
      }
      return;
    }
    final String primeSource = source;
    DitaaContext ditaaContext = findDitaaContext(source);
    if (ditaaContext != null) {
      logging.reroute("plantuml", "ditaa", ditaaContext.getSource(), fileFormat);
      // found a ditaa context, delegate to the optimized ditaa service
      vertx.executeBlocking(future -> {
        try {
          ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
          // REMIND: options are unsupported for now.
          Ditaa.convert(fileFormat, options, new ByteArrayInputStream(ditaaContext.getSource().getBytes()), outputStream);
          future.complete(outputStream.toByteArray());
        } catch (IllegalStateException e) {
          future.fail(e);
        }
      }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
    } else {
      // ...otherwise, continue with PlantUML
      vertx.executeBlocking(future -> {
        try {
          byte[] data = convert(primeSource, fileFormat, options);
          future.complete(data);
        } catch (IllegalStateException e) {
          future.fail(e);
        }
      }, res -> handler.handle(res.map(o -> Buffer.buffer((byte[]) o))));
    }
  }

  static byte[] convert(String source, FileFormat format, JsonObject options) {
    try {
      String theme = options.getString("theme");
      if (theme != null && !theme.trim().isEmpty()) {
        // add !theme directive just after the @start directive
        source = START_BLOCK_RX.matcher(source).replaceAll("$1!theme " + theme + "\n");
      }
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
      } else {
        if (include.toLowerCase().contains("c4.puml")) {
          sb.append(c4).append("\n");
        } else if (include.toLowerCase().contains("c4_component.puml")) {
          sb.append(c4Component).append("\n");
        } else if (include.toLowerCase().contains("c4_container.puml")) {
          sb.append(c4Container).append("\n");
        } else if (include.toLowerCase().contains("c4_context.puml")) {
          sb.append(c4Context).append("\n");
        } else if (include.toLowerCase().contains("c4_deployment.puml")) {
          sb.append(c4Deployment).append("\n");
        } else if (include.toLowerCase().contains("c4_dynamic.puml")) {
          sb.append(c4Dynamic).append("\n");
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
            // are eligible for include (unless OptionFlags.ALLOW_INCLUDE has been set to true)
            sb.append(line).append("\n");
          } else if (includeWhitelist.stream().anyMatch(p -> p.matcher(include).matches())) {
            sb.append(line).append("\n");
          }
        }
      }
    } else {
      sb.append(line).append("\n");
    }
  }

  private static String read(String resource) {
    InputStream input = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);
    try {
      if (input == null) {
        throw new IOException("Unable to get resource: " + resource);
      }
      try (BufferedReader buffer = new BufferedReader(new InputStreamReader(input))) {
        return buffer.lines().collect(Collectors.joining("\n"));
      }
    } catch (IOException e) {
      throw new RuntimeException("Unable to initialize the C4 PlantUML service", e);
    }
  }

  /**
   * Try to find a ditaa context from a PlantUML source.
   * @param source PlantUML source
   * @return a {@link DitaaContext} or null if not found
   */
  static DitaaContext findDitaaContext(String source) {
    if (source.contains("@startditaa") && source.contains("@endditaa")) {
      Matcher ditaablockMatcher = STARTDITAA_BLOCK_RX.matcher(source);
      if (ditaablockMatcher.find()) {
        String ditaaOptions = ditaablockMatcher.group("opts");
        String ditaaSource = ditaablockMatcher.group("source");
        return new DitaaContext(ditaaSource, ditaaOptions);
      }
    } else {
      Matcher ditaaMatcher = DITAA_KEYWORD_BOCK_RX.matcher(source);
      if (ditaaMatcher.find()) {
        String ditaaOptions = ditaaMatcher.group("opts");
        String ditaaSource = ditaaMatcher.group("source");
        return new DitaaContext(ditaaSource, ditaaOptions);
      }
    }
    return null;
  }
}
