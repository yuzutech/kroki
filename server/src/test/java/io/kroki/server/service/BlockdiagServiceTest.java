package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.format.FileFormat;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class BlockdiagServiceTest {

  private Vertx vertx;
  private Commander commanderMock;

  @BeforeEach
  public void setUp() throws Exception {
    vertx = Vertx.vertx();
    commanderMock = mock(Commander.class);
    when(commanderMock.execute(any(), any(String[].class))).thenReturn("<svg>blockdiag</svg>".getBytes());
  }

  @AfterEach
  public void tearDown() {
    vertx.close();
  }

  private Blockdiag blockdiag(String safeMode) {
    HashMap<String, Object> config = new HashMap<>();
    if (safeMode != null) {
      config.put("KROKI_SAFE_MODE", safeMode);
    }
    config.put("KROKI_BLOCKDIAG_BIN_PATH", "/path/to/blockdiag");
    return new Blockdiag(vertx, new JsonObject(config), commanderMock);
  }

  @ParameterizedTest
  @ValueSource(strings = {"secure", "safe"})
  public void should_not_read_external_images_unless_unsafe(String safeMode) throws Throwable {
    blockdiag(safeMode).convert("test", "nwdiag", FileFormat.SVG, new JsonObject()).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute("test".getBytes(),
      "/path/to/blockdiag",
      "--module=nwdiag",
      "--font=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
      "-Tsvg",
      "--no-external-images",
      "-");
  }

  @Test
  public void should_not_read_external_images_by_default() throws Throwable {
    blockdiag(null).convert("test", "blockdiag", FileFormat.PNG, new JsonObject()).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute("test".getBytes(),
      "/path/to/blockdiag",
      "--module=blockdiag",
      "--font=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
      "-Tpng",
      "--no-external-images",
      "-");
  }

  @Test
  public void should_read_external_images_when_unsafe() throws Throwable {
    blockdiag("unsafe").convert("test", "blockdiag", FileFormat.SVG, new JsonObject()).await(2, TimeUnit.SECONDS);
    Mockito.verify(commanderMock).execute("test".getBytes(),
      "/path/to/blockdiag",
      "--module=blockdiag",
      "--font=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
      "-Tsvg",
      "-");
  }
}
