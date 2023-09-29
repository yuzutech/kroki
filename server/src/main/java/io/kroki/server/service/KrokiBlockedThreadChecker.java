package io.kroki.server.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.google.common.annotations.VisibleForTesting;
import io.vertx.core.Vertx;
import io.vertx.core.VertxException;
import io.vertx.core.VertxOptions;
import io.vertx.core.impl.VertxInternal;
import io.vertx.core.impl.btc.BlockedThreadEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

public class KrokiBlockedThreadChecker {

  private static final Logger logger = LoggerFactory.getLogger(KrokiBlockedThreadChecker.class);

  private final int evenLoopPoolSize;
  private final int workerPoolSize;
  private final Duration trackStatsFor;

  private final Cache<String, Instant> eventLoopStats;
  private final Cache<String, Instant> workerStats;

  private final Clock clock;

  public KrokiBlockedThreadChecker(Vertx vertx, VertxOptions options) {
    this(vertx, options, null);
  }

  KrokiBlockedThreadChecker(Vertx vertx, VertxOptions options, Clock clock) {
    this.evenLoopPoolSize = options.getEventLoopPoolSize();
    this.workerPoolSize = options.getWorkerPoolSize();
    this.trackStatsFor = Duration.of(options.getBlockedThreadCheckInterval(), options.getBlockedThreadCheckIntervalUnit().toChronoUnit());

    eventLoopStats = Caffeine.newBuilder()
      .maximumSize(evenLoopPoolSize)
      .expireAfterWrite(trackStatsFor)
      .build();
    workerStats = Caffeine.newBuilder()
      .maximumSize(workerPoolSize)
      .expireAfterWrite(trackStatsFor)
      .build();

    if (vertx instanceof VertxInternal) {
      ((VertxInternal) vertx).blockedThreadChecker().setThreadBlockedHandler((bte) -> {
        defaultHandlerFromVertx(bte);
        trackBlockedThread(bte);
      });
    }

    this.clock = Objects.requireNonNullElseGet(clock, Clock::systemDefaultZone);
  }

  public long blockedWorkerThreadPercentage() {
    return Math.floorDiv(nonExpiredEntryCount(workerStats) * 100, workerPoolSize);
  }

  public long blockedEventLoopThreadPercentage() {
    return Math.floorDiv(nonExpiredEntryCount(eventLoopStats) * 100, evenLoopPoolSize);
  }

  private long nonExpiredEntryCount(Cache<String, Instant> stats) {
    final var now = this.clock.instant();
    return stats.asMap().entrySet().stream().filter(e -> e.getValue().isAfter(now)).count();
  }

  @VisibleForTesting
  void trackBlockedThread(BlockedThreadEvent bte) {
    if (bte.duration() > bte.warningExceptionTime()) {
      if (bte.thread().getName().startsWith("vert.x-worker-thread")) {
        workerStats.put(bte.thread().getName(), this.clock.instant().plus(trackStatsFor));
      } else if (bte.thread().getName().startsWith("vert.x-eventloop-thread")) {
        eventLoopStats.put(bte.thread().getName(), this.clock.instant().plus(trackStatsFor));
      }
    }
  }

  private void defaultHandlerFromVertx(BlockedThreadEvent bte) {
    final String message = "Thread " + bte.thread() + " has been blocked for " + (bte.duration() / 1_000_000) + " ms, time limit is " + (bte.maxExecTime() / 1_000_000) + " ms";
    if (bte.duration() <= bte.warningExceptionTime()) {
      logger.warn(message);
    } else {
      VertxException stackTrace = new VertxException("Thread blocked");
      stackTrace.setStackTrace(bte.thread().getStackTrace());
      logger.warn(message, stackTrace);
    }
  }
}
