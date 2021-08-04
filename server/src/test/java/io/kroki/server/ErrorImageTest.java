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
    assertThat(svgWithDimension.getSource()).contains("<tspan x=\"10\" dy=\"16\">There is no layout engine support for \"nfds\"</tspan>\n");
    assertThat(svgWithDimension.getSource()).contains("<tspan x=\"10\" dy=\"16\">Use one of: circo dot fdp neato nop nop1 nop2 osage patchwork sfdp twopi</tspan>\n");
  }
}
