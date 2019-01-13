package io.kroki.server.service;

import io.kroki.server.decode.DecodeException;
import io.kroki.server.decode.DiagramSource;
import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.RoutingContext;
import net.sourceforge.plantuml.BlockUml;
import net.sourceforge.plantuml.FileFormat;
import net.sourceforge.plantuml.FileFormatOption;
import net.sourceforge.plantuml.PSystemError;
import net.sourceforge.plantuml.SourceStringReader;
import net.sourceforge.plantuml.code.Base64Coder;
import net.sourceforge.plantuml.code.Transcoder;
import net.sourceforge.plantuml.code.TranscoderUtil;
import net.sourceforge.plantuml.core.Diagram;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class Plantuml {

  public static final Map<FileFormat, String> CONTENT_TYPE;

  static {
    Map<FileFormat, String> map = new HashMap<>();
    map.put(FileFormat.PNG, "image/png");
    map.put(FileFormat.SVG, "image/svg+xml");
    map.put(FileFormat.EPS, "application/postscript");
    map.put(FileFormat.UTXT, "text/plain;charset=UTF-8");
    map.put(FileFormat.BASE64, "text/plain; charset=x-user-defined");
    CONTENT_TYPE = Collections.unmodifiableMap(map);
  }

  public static Handler<RoutingContext> convertRoute() {
    return routingContext -> {
      HttpServerResponse response = routingContext.response();
      String sourceEncoded = routingContext.request().getParam("source_encoded");
      String outputFormat = routingContext.request().getParam("output_format");
      FileFormat fileFormat = FileFormat.valueOf(outputFormat.toUpperCase());
      String sourceDecoded;
      try {
        sourceDecoded = Plantuml.decode(sourceEncoded);
      } catch (DecodeException | UnsupportedEncodingException e) {
        response
          .setStatusCode(400)
          .end(e.getMessage());
        return;
      }
      byte[] data = convert(sourceDecoded, fileFormat);
      response
        .putHeader("Content-Type", Plantuml.CONTENT_TYPE.get(fileFormat))
        .end(Buffer.buffer(data));
    };
  }

  private static byte[] convert(String source, FileFormat format) {
    try {
      SourceStringReader reader = new SourceStringReader(source);
      if (format == FileFormat.BASE64) {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream();
        reader.outputImage(baos, 0, new FileFormatOption(FileFormat.PNG));
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
      diagram.exportDiagram(byteArrayOutputStream, 0, new FileFormatOption(format));
      return byteArrayOutputStream.toByteArray();
    } catch (IOException e) {
      throw new RuntimeException("Bad request", e);
    }
  }

  public static String decode(String source) throws DecodeException, UnsupportedEncodingException {
    String text = URLDecoder.decode(source, "UTF-8");
    try {
      Transcoder transcoder = TranscoderUtil.getDefaultTranscoder();
      text = transcoder.decode(text);
      // encapsulate the UML syntax if necessary
    } catch (IOException ioException) {
      // Unable to decode with the PlantUML decoder, try the default decoder
      text = DiagramSource.decode(text);
    }
    String uml;
    if (text.startsWith("@start")) {
      uml = text;
    } else {
      StringBuilder plantUmlSource = new StringBuilder();
      plantUmlSource.append("@startuml\n");
      plantUmlSource.append(text);
      if (!text.endsWith("\n")) {
        plantUmlSource.append("\n");
      }
      plantUmlSource.append("@enduml");
      uml = plantUmlSource.toString();
    }
    return uml;
  }
}
