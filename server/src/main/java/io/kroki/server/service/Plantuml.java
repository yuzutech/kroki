package io.kroki.server.service;

import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.BadRequestException;
import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;
import net.sourceforge.plantuml.BlockUml;
import net.sourceforge.plantuml.FileFormatOption;
import net.sourceforge.plantuml.PSystemError;
import net.sourceforge.plantuml.SourceStringReader;
import net.sourceforge.plantuml.code.Base64Coder;
import net.sourceforge.plantuml.code.Transcoder;
import net.sourceforge.plantuml.code.TranscoderUtil;
import net.sourceforge.plantuml.core.Diagram;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Plantuml implements DiagramHandler {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.PNG, FileFormat.SVG, FileFormat.JPEG, FileFormat.BASE64);

  private static final Pattern INCLUDE_RX = Pattern.compile("^\\s*!include(?:url)?\\s+.*");
  private final SourceDecoder sourceDecoder;

  public Plantuml() {
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) {
        return Plantuml.unsafeDecode(encoded);
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
    response
      .putHeader("Content-Type", ContentType.get(fileFormat))
      .end(Buffer.buffer(data));
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
      final BlockUml blockUml = reader.getBlocks().get(0);
      final Diagram diagram = blockUml.getDiagram();
      if (diagram instanceof PSystemError) {
        throw new RuntimeException("Bad request");
      }
      ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
      diagram.exportDiagram(byteArrayOutputStream, 0, new FileFormatOption(format.toPlantumlFileFormat()));
      return byteArrayOutputStream.toByteArray();
    } catch (IOException e) {
      throw new RuntimeException("Bad request", e);
    }
  }

  static String unsafeDecode(String source) {
    try {
      return decode(source);
    } catch (UnsupportedEncodingException e) {
      throw new BadRequestException("Characters must be encoded in UTF-8.", e);
    }
  }

  static String decode(String source) throws UnsupportedEncodingException {
    String text = URLDecoder.decode(source, "UTF-8");
    try {
      Transcoder transcoder = TranscoderUtil.getDefaultTranscoder();
      text = transcoder.decode(text);
      // encapsulate the UML syntax if necessary
    } catch (ArrayIndexOutOfBoundsException | IOException e) {
      // Unable to decode with the PlantUML decoder, try the default decoder
      text = DiagramSource.decode(text);
    }
    return text;
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

  private static String sanitize(String input) throws IOException {
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
    if (!matcher.matches()) {
      sb.append(line).append("\n");
    }
  }
}
