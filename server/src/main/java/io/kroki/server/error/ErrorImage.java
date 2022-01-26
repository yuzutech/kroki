package io.kroki.server.error;

import com.kitfox.svg.SVGDiagram;
import com.kitfox.svg.SVGElement;
import com.kitfox.svg.SVGException;
import com.kitfox.svg.SVGUniverse;
import com.kitfox.svg.app.beans.SVGIcon;
import org.slf4j.bridge.SLF4JBridgeHandler;

import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;

public class ErrorImage {

  static {
    // enable JUL to SLF4J bridge
    // JUL is used by https://github.com/blackears/svgSalamander (com.kitfox.svg)
    SLF4JBridgeHandler.removeHandlersForRootLogger();
    SLF4JBridgeHandler.install();
  }

  public static SVGWithDimension buildSVGImage(String errorMessage) throws IOException, SVGException {
    String[] lines = errorMessage.split("\\n");
    StringBuilder text = new StringBuilder();
    String fontSize = "16";
    String fontFamily = "BlinkMacSystemFont, -apple-system, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', Arial, sans-serif";
    for (String line : lines) {
      // QUESTION: should we use ellipsis or force break if line length is too long?
      text.append("<tspan x=\"10\" dy=\"").append(fontSize).append("\">").append(line).append("</tspan>\n");
    }
    String svg = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n" +
      "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">\n" +
      "<rect fill=\"#fff5f7\" width=\"100%\" height=\"100%\"/>\n" +
      "<text id=\"text\" xml:space=\"preserve\" font-weight=\"bold\" fill=\"#cd0930\" font-family=\"" + fontFamily + "\" font-size=\"" + fontSize + "px\" x=\"0\" y=\"5\" dy=\"0\">\n" +
      text +
      "</text>\n" +
      "<rect fill=\"#ff3860\" width=\"3\" height=\"100%\"/>\n" +
      "</svg>";
    Dimension dimension = computeDimension(svg);
    String result = svg
      .replaceAll("<svg xmlns=.*>\\n", "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + dimension.width + "\" height=\"" + dimension.height + "\" viewBox=\"0 0 " + dimension.width + " " + dimension.height + "\" version=\"1.1\">\n")
      .replaceAll("width=\"100%\"", "width=\"" + dimension.width + "\"")
      .replaceAll("height=\"100%\"", "height=\"" + dimension.height + "\"");
    return new SVGWithDimension(result, dimension);
  }

  public static BufferedImage buildPNGImage(String errorMessage) throws IOException, SVGException {
    SVGWithDimension svgWithDimension = buildSVGImage(errorMessage);
    try (ByteArrayInputStream svgInputStream = new ByteArrayInputStream(svgWithDimension.source.getBytes(StandardCharsets.UTF_8))) {
      SVGUniverse svgUniverse = new SVGUniverse();
      URI svgUri = svgUniverse.loadSVG(svgInputStream, "error-message");
      SVGDiagram diagram = svgUniverse.getDiagram(svgUri);
      SVGIcon svgIcon = new SVGIcon();
      svgIcon.setSvgUniverse(svgUniverse);
      svgIcon.setSvgURI(svgUri);
      svgIcon.setAntiAlias(true);
      svgIcon.setInterpolation(SVGIcon.INTERP_BICUBIC);
      int width = (int) diagram.getWidth();
      int height = (int) diagram.getHeight();
      BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
      Graphics2D g = image.createGraphics();
      g.setClip(0, 0, width, height);
      svgIcon.paintIcon(null, g, 0, 0);
      g.dispose();
      return image;
    }
  }

  private static Dimension computeDimension(String svg) throws IOException, SVGException {
    try (ByteArrayInputStream svgInputStream = new ByteArrayInputStream(svg.getBytes(StandardCharsets.UTF_8))) {
      SVGUniverse svgUniverse = new SVGUniverse();
      URI svgUri = svgUniverse.loadSVG(svgInputStream, "error-message");
      SVGDiagram diagram = svgUniverse.getDiagram(svgUri);
      SVGElement textElement = diagram.getElement("text");
      Rectangle2D bbox = textElement.getRoot().getBoundingBox();
      return new Dimension((int) Math.floor(bbox.getWidth() + bbox.getX()) + 10, (int) Math.floor(bbox.getHeight() + bbox.getY()) + 5);
    }
  }

  public static class SVGWithDimension {
    private final String source;
    private final Dimension dimension;

    public SVGWithDimension(String source, Dimension dimension) {
      this.source = source;
      this.dimension = dimension;
    }

    public String getSource() {
      return source;
    }

    public Dimension getDimension() {
      return dimension;
    }
  }
}
