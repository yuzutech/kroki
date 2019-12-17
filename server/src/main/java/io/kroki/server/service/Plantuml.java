package io.kroki.server.service;

import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.response.Caching;
import io.kroki.server.response.DiagramResponse;
import io.vertx.core.http.HttpServerResponse;
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

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Plantuml implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG, FileFormat.BASE64, FileFormat.TXT, FileFormat.UTXT);

  private static final Pattern INCLUDE_RX = Pattern.compile("^\\s*!include(?:url)?\\s+(.*)");
  private static final Pattern STDLIB_PATH_RX = Pattern.compile("<([a-zA-Z0-9]+)/[^>]+>");

  private final SourceDecoder sourceDecoder;
  private final DiagramResponse diagramResponse;
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

  public Plantuml() {
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.plantumlDecode(encoded);
      }
    };
    this.diagramResponse = new DiagramResponse(new Caching(Version.etag()));
    // Disable include for security reasons
    OptionFlags.ALLOW_INCLUDE = false;
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
      source = sanitize(sourceDecoded);
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

  static String sanitize(String input) throws IOException {
    try (BufferedReader reader = new BufferedReader(new StringReader(input))) {
      StringBuilder sb = new StringBuilder();
      String line = reader.readLine();
      while (line != null) {
        ignoreInclude(line, sb);
        line = reader.readLine();
      }
      return sb.toString();
    }
  }

  private static void ignoreInclude(String line, StringBuilder sb) {
    Matcher matcher = INCLUDE_RX.matcher(line);
    if (matcher.matches()) {
      String include = matcher.group(1);
      Matcher stdlibPathMatcher = STDLIB_PATH_RX.matcher(include);
      if (stdlibPathMatcher.matches()) {
        String prefix = stdlibPathMatcher.group(1).toLowerCase();
        if (STDLIB.contains(prefix)) {
          sb.append(line).append("\n");
        }
      }
    } else {
      sb.append(line).append("\n");
    }
  }
}
