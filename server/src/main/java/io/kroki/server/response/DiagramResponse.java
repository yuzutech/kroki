package io.kroki.server.response;

import io.kroki.server.format.ContentType;
import io.kroki.server.format.FileFormat;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpServerResponse;

public class DiagramResponse {

  private final Caching caching;

  public DiagramResponse(Caching caching) {
    this.caching = caching;
  }

  public void end(HttpServerResponse response, String source, String contentType, Buffer buffer) {
    if (caching != null) {
      caching.addHeaderForCache(response, source, System.currentTimeMillis());
    }
    response
      .putHeader(HttpHeaders.CONTENT_TYPE, contentType)
      .end(buffer);
  }


  public void end(HttpServerResponse response, String source, FileFormat fileFormat, Buffer buffer) {
    end(response, source, ContentType.get(fileFormat), buffer);
  }

  public void end(HttpServerResponse response, String source, FileFormat fileFormat, byte[] result) {
    end(response, source, fileFormat, Buffer.buffer(result));
  }
}
