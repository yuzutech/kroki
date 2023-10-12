package io.kroki.server.service;

import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpHeaders;
import io.vertx.ext.web.RoutingContext;

public class MetricHandler {

  private final KrokiBlockedThreadChecker blockedThreadChecker;
  private final String namespace;

  public MetricHandler(KrokiBlockedThreadChecker blockedThreadChecker) {
    this.blockedThreadChecker = blockedThreadChecker;
    this.namespace = "kroki";
  }

  public Handler<RoutingContext> create() {
    String workerThreadBlockedMetricName = namespace + "_worker_thread_blocked_percentage";
    String eventLoopThreadBlockedMetricName = namespace + "_event_loop_thread_blocked_percentage";
    return routingContext -> {
      long timestamp = System.currentTimeMillis();
      Buffer buffer = Buffer.buffer();
      buffer.appendString("# HELP " + workerThreadBlockedMetricName + " The percentage of worker thread blocked.\n");
      buffer.appendString("# TYPE " + workerThreadBlockedMetricName + " gauge\n");
      buffer.appendString(String.join(" ", workerThreadBlockedMetricName, Long.toString(blockedThreadChecker.blockedWorkerThreadPercentage()), Long.toString(timestamp)) + "\n\n");
      buffer.appendString("# HELP " + eventLoopThreadBlockedMetricName + " The percentage of event loop thread blocked.\n");
      buffer.appendString("# TYPE " + eventLoopThreadBlockedMetricName + " gauge\n");
      buffer.appendString(String.join(" ", eventLoopThreadBlockedMetricName, Long.toString(blockedThreadChecker.blockedEventLoopThreadPercentage()), Long.toString(timestamp)) + "\n\n");
      routingContext
        .response()
        .putHeader(HttpHeaders.CONTENT_TYPE, "text/plain; version=0.0.4")
        .end(buffer);
    };
  }
}
