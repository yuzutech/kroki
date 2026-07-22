export interface RenderMetricEvent {
  engine: string;
  format: string;
  statusCode: number;
  durationMs: number;
  cache?: "HIT" | "MISS" | "BYPASS";
  errorCode?: string;
}

function labels(values: Record<string, string>): string {
  return Object.entries(values)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}="${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`)
    .join(",");
}

export class GatewayMetrics {
  private readonly requests = new Map<string, number>();
  private readonly durations = new Map<string, { count: number; seconds: number }>();
  private readonly cache = new Map<string, number>();
  private readonly errors = new Map<string, number>();

  record(event: RenderMetricEvent): void {
    const dimensions = labels({ engine: event.engine || "unknown", format: event.format || "unknown", status: String(event.statusCode) });
    this.requests.set(dimensions, (this.requests.get(dimensions) ?? 0) + 1);
    const duration = this.durations.get(dimensions) ?? { count: 0, seconds: 0 };
    duration.count += 1;
    duration.seconds += event.durationMs / 1000;
    this.durations.set(dimensions, duration);
    if (event.cache) this.cache.set(event.cache, (this.cache.get(event.cache) ?? 0) + 1);
    if (event.errorCode) this.errors.set(event.errorCode, (this.errors.get(event.errorCode) ?? 0) + 1);
  }

  render(active: number, queued: number): string {
    const lines = [
      "# HELP diagram_gateway_render_requests_total Render requests completed.",
      "# TYPE diagram_gateway_render_requests_total counter",
    ];
    for (const [dimensions, count] of [...this.requests].sort()) {
      lines.push(`diagram_gateway_render_requests_total{${dimensions}} ${count}`);
    }
    lines.push(
      "# HELP diagram_gateway_render_duration_seconds Render request duration.",
      "# TYPE diagram_gateway_render_duration_seconds summary",
    );
    for (const [dimensions, duration] of [...this.durations].sort()) {
      lines.push(`diagram_gateway_render_duration_seconds_sum{${dimensions}} ${duration.seconds}`);
      lines.push(`diagram_gateway_render_duration_seconds_count{${dimensions}} ${duration.count}`);
    }
    lines.push("# HELP diagram_gateway_cache_results_total Render cache outcomes.", "# TYPE diagram_gateway_cache_results_total counter");
    for (const [result, count] of [...this.cache].sort()) lines.push(`diagram_gateway_cache_results_total{result="${result}"} ${count}`);
    lines.push("# HELP diagram_gateway_render_errors_total Normalized render errors.", "# TYPE diagram_gateway_render_errors_total counter");
    for (const [code, count] of [...this.errors].sort()) lines.push(`diagram_gateway_render_errors_total{code="${code}"} ${count}`);
    lines.push(
      "# HELP diagram_gateway_render_active Active backend renders.",
      "# TYPE diagram_gateway_render_active gauge",
      `diagram_gateway_render_active ${active}`,
      "# HELP diagram_gateway_render_queued Queued backend renders.",
      "# TYPE diagram_gateway_render_queued gauge",
      `diagram_gateway_render_queued ${queued}`,
    );
    return `${lines.join("\n")}\n`;
  }
}
