package io.kroki.server.response;

import io.kroki.server.Main;
import io.kroki.server.decode.transcoder.AsciiEncoder;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpServerResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.security.MessageDigest;

public class Caching {

  private static final Logger logger = LoggerFactory.getLogger(Caching.class);

  private final long compileTime;
  private final String version;
  private final DateTimeFormatter httpHeaderFormatter = DateTimeFormatter
    .ofPattern("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH)
    .withZone(ZoneId.of("GMT"));

  public Caching(String version) {
    this.version = version;
    String appBuildTime = Main.getApplicationProperty("app.buildTime", "");
    long compileTime;
    try {
      compileTime = Instant
        .parse(appBuildTime)
        .toEpochMilli();
    } catch (DateTimeParseException e) {
      logger.warn("Unable to parse: " + appBuildTime + ", using start time", e);
      compileTime = Instant.now().toEpochMilli();
    }
    this.compileTime = compileTime;
  }

  public void addHeaderForCache(HttpServerResponse response, String data) {
    addHeaderForCache(response, data, System.currentTimeMillis());
  }

  void addHeaderForCache(HttpServerResponse response, String data, long today) {
    final int maxAge = 3600 * 24 * 5;
    // Add http headers to force the browser to cache the image
    response.putHeader(HttpHeaders.EXPIRES, httpDate(today + 1000L * maxAge));
    response.putHeader(HttpHeaders.DATE, httpDate(today));
    response.putHeader(HttpHeaders.LAST_MODIFIED, httpDate(compileTime));
    response.putHeader(HttpHeaders.CACHE_CONTROL, "public, max-age=" + maxAge);
    response.putHeader(HttpHeaders.ETAG, version + internalEtag(data));
  }

  private String httpDate(long millis) {
    return httpHeaderFormatter.format(Instant.ofEpochMilli(millis));
  }

  private String internalEtag(String data) {
    try {
      final AsciiEncoder coder = new AsciiEncoder();
      final MessageDigest msgDigest = MessageDigest.getInstance("MD5");
      msgDigest.update(data.getBytes(StandardCharsets.UTF_8));
      final byte[] digest = msgDigest.digest();
      return coder.encode(digest);
    } catch (Exception e) {
      logger.warn("Unable to generate an Etag", e);
      return "NOETAG";
    }
  }
}
