package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.response.Caching;
import io.kroki.server.response.DiagramResponse;
import io.kroki.server.security.SafeMode;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class Vega implements DiagramService {

  private static final List<FileFormat> SUPPORTED_FORMATS = Arrays.asList(FileFormat.SVG, FileFormat.PNG, FileFormat.PDF);
  private final Vertx vertx;
  private final String binPath;
  private final SourceDecoder sourceDecoder;
  private final DiagramResponse diagramResponse;
  private final SafeMode safeMode;
  private final Commander commander;
  private final SpecFormat specFormat;

  public Vega(Vertx vertx, JsonObject config, SpecFormat specFormat, Commander commander) {
    this.vertx = vertx;
    this.binPath = config.getString("KROKI_VEGA_BIN_PATH", "vega");
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
    if (specFormat == SpecFormat.DEFAULT) {
      this.diagramResponse = new DiagramResponse(new Caching("5.11.1"));
    } else {
      this.diagramResponse = new DiagramResponse(new Caching("4.11.0")); // Vega Lite
    }
    this.safeMode = SafeMode.get(config.getString("KROKI_SAFE_MODE", "secure"), SafeMode.SECURE);
    this.commander = commander;
    this.specFormat = specFormat;
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
  public void convert(RoutingContext routingContext, String sourceDecoded, String serviceName, FileFormat fileFormat) {
    HttpServerResponse response = routingContext.response();
    vertx.executeBlocking(future -> {
      try {
        byte[] result = vega(sourceDecoded.getBytes(), fileFormat.getName());
        future.complete(result);
      } catch (IOException | InterruptedException | IllegalStateException e) {
        future.fail(e);
      }
    }, res -> {
      if (res.failed()) {
        routingContext.fail(res.cause());
        return;
      }
      byte[] result = (byte[]) res.result();
      diagramResponse.end(response, sourceDecoded, fileFormat, result);
    });
  }

  private byte[] vega(byte[] source, String format) throws IOException, InterruptedException, IllegalStateException {
    return commander.execute(source, binPath,
      "--output-format=" + format,
      "--safe-mode=" + safeMode.name().toLowerCase(),
      "--spec-format=" + specFormat.name().toLowerCase());
  }

  public enum SpecFormat {
    DEFAULT,
    LITE;
  }
}
