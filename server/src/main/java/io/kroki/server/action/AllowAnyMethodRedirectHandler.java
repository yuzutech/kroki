package io.kroki.server.action;

import io.vertx.core.Future;
import io.vertx.core.http.HttpClientResponse;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.RequestOptions;
import io.vertx.core.http.impl.HttpUtils;

import java.net.URI;
import java.util.function.Function;

// https://github.com/eclipse-vertx/vert.x/blob/78ca74e30d8e0b7b8950c4c4030b45224c2a7e0a/vertx-core/src/main/java/io/vertx/core/http/impl/DefaultRedirectHandler.java
public class AllowAnyMethodRedirectHandler implements Function<HttpClientResponse, Future<RequestOptions>> {
  public AllowAnyMethodRedirectHandler() {
  }
  @Override
  public Future<RequestOptions> apply(HttpClientResponse resp) {
    try {
        int statusCode = resp.statusCode();
        String location = resp.getHeader(HttpHeaders.LOCATION);
        if (location != null && (statusCode == 301 || statusCode == 302 || statusCode == 303 || statusCode == 307
                                 || statusCode == 308)) {
          HttpMethod m = resp.request().getMethod();
          if (statusCode == 303) {
            m = HttpMethod.GET;
          }
          URI uri = HttpUtils.resolveURIReference(resp.request().absoluteURI(), location);
          boolean ssl;
          int port = uri.getPort();
          String protocol = uri.getScheme();
          char chend = protocol.charAt(protocol.length() - 1);
          if (chend == 'p') {
            ssl = false;
            if (port == -1) {
              port = 80;
            }
          } else if (chend == 's') {
            ssl = true;
            if (port == -1) {
              port = 443;
            }
          } else {
            return null;
          }
          String requestURI = uri.getPath();
          if (requestURI == null || requestURI.isEmpty()) {
            requestURI = "/";
          }
          String query = uri.getQuery();
          if (query != null) {
            requestURI += "?" + query;
          }
          RequestOptions options = new RequestOptions();
          options.setMethod(m);
          options.setHost(uri.getHost());
          options.setPort(port);
          options.setSsl(ssl);
          options.setURI(requestURI);
          options.setHeaders(resp.request().headers());
          options.removeHeader(HttpHeaders.CONTENT_LENGTH);
          return Future.succeededFuture(options);
        }
        return null;
      } catch (Exception e) {
        return Future.failedFuture(e);
      }
  }
}
