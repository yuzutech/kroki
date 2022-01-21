package io.kroki.server;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.matches;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;

import io.kroki.server.response.Caching;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpServerResponse;

public class ServerCachingTest {
  @Captor
  ArgumentCaptor<String> headerCaptor;

  @Captor
  ArgumentCaptor<String> valueCaptor;

  @Test
  void caching_header_test() {
    HttpServerResponse httpServerResponseMock = mock(HttpServerResponse.class);
    Caching caching = new Caching("1.2.3");
    LocalDateTime date = LocalDateTime.of(2022, 1, 2, 3, 4, 5);
    long today = date.toInstant(ZoneOffset.ofTotalSeconds(0)).toEpochMilli();
    caching.addHeaderForCache(httpServerResponseMock, "data", today);

    DateTimeFormatter httpFormatter = DateTimeFormatter
      .ofPattern("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH)
      .withZone(ZoneId.of("GMT"));
    String buildTimeStr = httpFormatter.format(Instant
      .parse(Main.getApplicationProperty("app.buildTime", "app.buildTime missing!")));
    Pattern buildTimeRE = Pattern.compile("^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), "
      + "[0-3][0-9] (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 202[2-9] "
      + "[0-2][0-9]:[0-5][0-9]:[0-5][0-9] GMT$");

    
    verify(httpServerResponseMock, times(1)).putHeader(HttpHeaders.DATE, "Sun, 02 Jan 2022 03:04:05 GMT");
    verify(httpServerResponseMock, times(1)).putHeader(HttpHeaders.EXPIRES, "Fri, 07 Jan 2022 03:04:05 GMT");
    verify(httpServerResponseMock, times(1)).putHeader(HttpHeaders.LAST_MODIFIED, buildTimeStr);
    verify(httpServerResponseMock, times(1)).putHeader(eq(HttpHeaders.LAST_MODIFIED), matches(buildTimeRE));
    verify(httpServerResponseMock, times(1)).putHeader(HttpHeaders.CACHE_CONTROL, "public, max-age=432000");
  }
}
