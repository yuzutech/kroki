package io.kroki.server.registry;

import io.kroki.server.action.Delegator;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.decode.SourceDecoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.format.FileFormat;
import io.kroki.server.service.DiagramService;
import io.vertx.core.Future;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;

import java.util.List;

/**
 * Delegates diagram conversion to a companion service registered dynamically at runtime
 * (see issue #1423), using the same wire protocol as the built-in companion containers
 * (e.g. {@link io.kroki.server.service.Bpmn}): {@code POST /<name>/<format>} with the
 * decoded source as the request body.
 */
public class CompanionDiagramService implements DiagramService {

  private final Delegator delegator;
  private final String host;
  private final int port;
  private final String version;
  private final List<FileFormat> formats;
  private final SourceDecoder sourceDecoder;

  public CompanionDiagramService(Delegator delegator, String host, int port, String version, List<FileFormat> formats) {
    this.delegator = delegator;
    this.host = host;
    this.port = port;
    this.version = version;
    this.formats = formats;
    this.sourceDecoder = new SourceDecoder() {
      @Override
      public String decode(String encoded) throws DecodeException {
        return DiagramSource.decode(encoded);
      }
    };
  }

  @Override
  public List<FileFormat> getSupportedFormats() {
    return formats;
  }

  @Override
  public SourceDecoder getSourceDecoder() {
    return sourceDecoder;
  }

  @Override
  public String getVersion() {
    return version;
  }

  @Override
  public Future<Buffer> convert(String sourceDecoded, String serviceName, FileFormat fileFormat, JsonObject options) {
    String requestURI = "/" + serviceName + "/" + fileFormat.getName();
    Future<HttpResponse<Buffer>> httpResponseFuture = this.delegator.delegate(host, port, requestURI, sourceDecoded, options);
    return Delegator.handle(host, port, requestURI, httpResponseFuture);
  }
}
