package io.kroki.server;

import net.sourceforge.plantuml.BlockUml;
import net.sourceforge.plantuml.FileFormat;
import net.sourceforge.plantuml.FileFormatOption;
import net.sourceforge.plantuml.PSystemError;
import net.sourceforge.plantuml.SourceStringReader;
import net.sourceforge.plantuml.code.Base64Coder;
import net.sourceforge.plantuml.core.Diagram;
import net.sourceforge.plantuml.core.DiagramDescription;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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

  public static byte[] convert(String source, FileFormat format) {
    try {
      SourceStringReader reader = new SourceStringReader(source);
      if (format == FileFormat.BASE64) {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream();
        final DiagramDescription result = reader.outputImage(baos, 0, new FileFormatOption(FileFormat.PNG));
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
}
