package io.kroki.server.service;

import io.vertx.core.VertxOptions;
import io.vertx.core.internal.threadchecker.BlockedThreadEvent;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

public class KrokiBlockedThreadCheckerTest {

  private static final VertxOptions TEST_OPTIONS = new VertxOptions()
    .setWorkerPoolSize(2)
    .setEventLoopPoolSize(1);

  @Test
  public void test_should_ignore_unknown_thread_prefix() {
    final var clock = new MutableFixedClock(Instant.now(), ZoneId.systemDefault());
    final var checker = new KrokiBlockedThreadChecker(null, TEST_OPTIONS, clock);

    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-unknown-thread"), 20, 10, 5));

    Assertions.assertEquals(0, checker.blockedWorkerThreadPercentage());
    Assertions.assertEquals(0, checker.blockedEventLoopThreadPercentage());
  }

  @Test
  public void test_should_track_blocked_worker_thread() {
    final var clock = new MutableFixedClock(Instant.now(), ZoneId.systemDefault());
    final var checker = new KrokiBlockedThreadChecker(null, TEST_OPTIONS, clock);

    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-worker-thread-1"), 20, 10, 5));

    Assertions.assertEquals(50, checker.blockedWorkerThreadPercentage());
    Assertions.assertEquals(0, checker.blockedEventLoopThreadPercentage());
  }

  @Test
  public void test_should_expire_tracked_worker_thread() {
    final var clock = new MutableFixedClock(Instant.now(), ZoneId.systemDefault());
    final var checker = new KrokiBlockedThreadChecker(null, TEST_OPTIONS, clock);

    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-worker-thread-1"), 20, 10, 5));
    clock.setInstant(Instant.now().plus(10, ChronoUnit.MINUTES));

    Assertions.assertEquals(0, checker.blockedWorkerThreadPercentage());
    Assertions.assertEquals(0, checker.blockedEventLoopThreadPercentage());
  }

  @Test
  public void test_should_not_track_same_worker_thread_multiple_time() {
    final var clock = new MutableFixedClock(Instant.now(), ZoneId.systemDefault());
    final var checker = new KrokiBlockedThreadChecker(null, TEST_OPTIONS, clock);

    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-worker-thread-1"), 20, 10, 5));
    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-worker-thread-1"), 20, 10, 5));
    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-worker-thread-1"), 20, 10, 5));

    Assertions.assertEquals(50, checker.blockedWorkerThreadPercentage());
    Assertions.assertEquals(0, checker.blockedEventLoopThreadPercentage());
  }

  @Test
  public void test_should_track_blocked_event_thread() {
    final var clock = new MutableFixedClock(Instant.now(), ZoneId.systemDefault());
    final var checker = new KrokiBlockedThreadChecker(null, TEST_OPTIONS, clock);

    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-eventloop-thread-1"), 20, 10, 5));

    Assertions.assertEquals(0, checker.blockedWorkerThreadPercentage());
    Assertions.assertEquals(100, checker.blockedEventLoopThreadPercentage());
  }

  @Test
  public void test_should_expire_tracked_event_thread() {
    final var clock = new MutableFixedClock(Instant.now(), ZoneId.systemDefault());
    final var checker = new KrokiBlockedThreadChecker(null, TEST_OPTIONS, clock);

    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-eventloop-thread-1"), 20, 10, 5));
    clock.setInstant(Instant.now().plus(10, ChronoUnit.MINUTES));

    Assertions.assertEquals(0, checker.blockedWorkerThreadPercentage());
    Assertions.assertEquals(0, checker.blockedEventLoopThreadPercentage());
  }

  @Test
  public void test_should_not_track_same_event_thread_multiple_time() {
    final var clock = new MutableFixedClock(Instant.now(), ZoneId.systemDefault());
    final var checker = new KrokiBlockedThreadChecker(null, TEST_OPTIONS, clock);

    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-eventloop-thread-1"), 20, 10, 5));
    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-eventloop-thread-1"), 20, 10, 5));
    checker.trackBlockedThread(new BlockedThreadEvent(new Thread("vert.x-eventloop-thread-1"), 20, 10, 5));

    Assertions.assertEquals(0, checker.blockedWorkerThreadPercentage());
    Assertions.assertEquals(100, checker.blockedEventLoopThreadPercentage());
  }
}
