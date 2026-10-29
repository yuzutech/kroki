import com.baselet.control.config.Config;
import com.baselet.control.config.handler.ConfigHandler;
import com.baselet.control.enums.Program;
import com.baselet.control.enums.RuntimeType;
import com.baselet.control.util.Utils;
import com.baselet.diagram.DiagramHandler;
import com.baselet.diagram.io.InputHandler;
import com.baselet.diagram.io.OutputHandler;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextFactory;
import org.xml.sax.SAXException;

import javax.xml.XMLConstants;
import javax.xml.parsers.SAXParserFactory;
import java.io.PrintStream;
import java.nio.file.Paths;

/**
 * Converts a UMLet diagram read from stdin to the format given as the first argument (svg, png, jpeg...), written to stdout.
 */
public class UmletCli {

  public static void main(String[] args) throws Exception {
    // AWT looks for an optional font configuration file in ${java.home}/lib, which a native image does not set,
    // and only falls back to Fontconfig when this directory exists (see sun.awt.FontConfiguration#findFontConfigFile):
    // use the directory of the binary, so that it also runs outside of /opt/umlet
    if (System.getProperty("java.home") == null) {
      System.setProperty("java.home", Paths.get("/proc/self/exe").toRealPath().getParent().toString());
    }
    // The headless mode set at build time is not kept at runtime: without it, AWT uses X11 when DISPLAY is set and fails
    System.setProperty("java.awt.headless", "true");
    // Custom elements are drawn by JavaScript code, which Rhino compiles to classes by default:
    // interpret it instead, since a native image cannot define classes at runtime
    ContextFactory.initGlobal(new ContextFactory() {
      @Override
      protected void onContextCreated(Context cx) {
        super.onContextCreated(cx);
        cx.setOptimizationLevel(-1);
      }
    });
    String outputFormat = args[0];
    Program.init(Utils.readBuildInfo().version, RuntimeType.BATCH);
    ConfigHandler.loadConfig();
    DiagramHandler handler = DiagramHandler.forExport(null);
    // Read the diagram like com.baselet.diagram.io.DiagramFileHandler#doOpen does,
    // but report invalid XML instead of logging it and exporting an empty diagram
    try {
      newParserFactory().newSAXParser().parse(System.in, new InputHandler(handler));
    } catch (SAXException e) {
      System.err.println(e.getMessage());
      System.exit(1);
    }
    PrintStream out = System.out;
    OutputHandler.createToStream(outputFormat, out, handler);
    out.flush();
  }

  private static SAXParserFactory newParserFactory() throws Exception {
    SAXParserFactory factory = SAXParserFactory.newInstance();
    if (Config.getInstance().isSecureXmlProcessing()) {
      factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
      factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
      factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
      factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
    }
    return factory;
  }
}
