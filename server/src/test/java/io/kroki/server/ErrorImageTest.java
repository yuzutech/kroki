package io.kroki.server;

import com.kitfox.svg.SVGException;
import io.kroki.server.error.ErrorImage;
import org.junit.jupiter.api.Test;

import java.awt.Dimension;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

public class ErrorImageTest {

  @Test
  public void should_generate_svg_error_image() throws IOException, SVGException {
    ErrorImage.SVGWithDimension svgWithDimension = ErrorImage.buildSVGImage("There is no layout engine support for \"nfds\"\nUse one of: circo dot fdp neato nop nop1 nop2 osage patchwork sfdp twopi");
    Dimension dimension = svgWithDimension.getDimension();
    assertThat(dimension.width).isGreaterThan(500);
    assertThat(dimension.height).isGreaterThan(40);
    assertThat(svgWithDimension.getSource()).contains("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n");
    assertThat(svgWithDimension.getSource()).contains("<tspan x=\"10\" dy=\"16\">There is no layout engine support for &quot;nfds&quot;</tspan>\n");
    assertThat(svgWithDimension.getSource()).contains("<tspan x=\"10\" dy=\"16\">Use one of: circo dot fdp neato nop nop1 nop2 osage patchwork sfdp twopi</tspan>\n");
  }

  @Test
  public void should_truncate_long_error_lines() throws IOException, SVGException {
    ErrorImage.SVGWithDimension svgWithDimension = ErrorImage.buildSVGImage("This is a very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long line.\nThis is a short line.");
    Dimension dimension = svgWithDimension.getDimension();
    assertThat(dimension.width).isGreaterThan(500);
    assertThat(dimension.height).isGreaterThan(40);
    assertThat(svgWithDimension.getSource()).contains("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n");
    assertThat(svgWithDimension.getSource()).contains("<tspan x=\"10\" dy=\"16\">This is a very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very …</tspan>\n");
    assertThat(svgWithDimension.getSource()).contains("<tspan x=\"10\" dy=\"16\">This is a short line.</tspan>\n");
  }

  @Test
  public void should_escape_characters_using_xml_entities() throws IOException, SVGException {
    ErrorImage.SVGWithDimension svgWithDimension = ErrorImage.buildSVGImage("This line contains unsafe characters </tspan> & must be escaped!\"\"''<!--");
    Dimension dimension = svgWithDimension.getDimension();
    assertThat(dimension.width).isGreaterThan(500);
    assertThat(dimension.height).isGreaterThan(20);
    assertThat(svgWithDimension.getSource()).contains("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n");
    assertThat(svgWithDimension.getSource()).contains("<tspan x=\"10\" dy=\"16\">This line contains unsafe characters &lt;/tspan&gt; &amp; must be escaped!&quot;&quot;&apos;&apos;&lt;!--</tspan>\n");
  }
}
