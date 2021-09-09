package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class GraphVizServiceTest {

  @Test
  public void should_call_graphviz_with_correct_arguments() throws Throwable {
    Vertx vertx = Vertx.vertx();
    Commander commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any())).thenReturn("<svg>graphviz</svg>".getBytes());
    HashMap<String, Object> config = new HashMap<>();
    config.put("KROKI_SAFE_MODE", "unsafe");
    config.put("KROKI_DOT_BIN_PATH", "/path/to/dot");
    Graphviz graphvizService = new Graphviz(vertx, new JsonObject(config), commanderMock);

    VertxTestContext testContext = new VertxTestContext();
    JsonObject options = new JsonObject();
    options.put("node-attribute-fontcolor", "Crimson");
    options.put("node-attribute-shape", "rect");
    options.put("layout", "neato");
    options.put("graph-attribute-fontcolor", "SteelBlue");
    options.put("graph-attribute-label", "Hello World");
    options.put("edge-attribute-color", "NavajoWhite");
    options.put("edge-attribute-arrowhead", "diamond");
    graphvizService.convert("{}", "graphviz", FileFormat.SVG, options, testContext.succeeding(buffer -> testContext.verify(() -> {
      assertThat(buffer.toString()).isEqualTo("<svg>graphviz</svg>");
      testContext.completeNow();
    })));
    // wait at most 2000ms
    assertThat(testContext.awaitCompletion(2, TimeUnit.SECONDS)).isTrue();
    if (testContext.failed()) {
      throw testContext.causeOfFailure();
    }
    Mockito.verify(commanderMock).execute("{}".getBytes(), "/path/to/dot", "-Tsvg", "-Kneato", "-Nfontcolor=Crimson", "-Nshape=rect", "-Gfontcolor=SteelBlue", "-Glabel=Hello World", "-Ecolor=NavajoWhite", "-Earrowhead=diamond");
  }
}
