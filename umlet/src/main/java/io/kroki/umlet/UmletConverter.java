package io.kroki.umlet;

import com.baselet.control.config.handler.ConfigHandler;
import com.baselet.control.enums.Program;
import com.baselet.control.enums.RuntimeType;
import com.baselet.control.util.Utils;
import com.baselet.diagram.DiagramHandler;
import com.baselet.diagram.io.OutputHandler;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static com.baselet.control.util.Utils.readBuildInfo;

public class UmletConverter {

  static {
    Utils.BuildInfo buildInfo = readBuildInfo();
    Program.init(buildInfo.version, RuntimeType.BATCH);
    ConfigHandler.loadConfig();
  }

  public static byte[] convert(String source, String outputFormat) throws IOException {
    DiagramHandler handler = DiagramHandler.forExport(source);
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    OutputHandler.createToStream(outputFormat, baos, handler);
    return baos.toByteArray();
  }
}
