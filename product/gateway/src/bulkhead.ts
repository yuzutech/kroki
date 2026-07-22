export class RenderCapacityExceeded extends Error {
  constructor() {
    super("Renderer concurrency and pending queue capacity are exhausted");
    this.name = "RenderCapacityExceeded";
  }
}

type Release = () => void;

export class RenderBulkhead {
  private activeCount = 0;
  private readonly pending: Array<(release: Release) => void> = [];

  constructor(
    private readonly maxConcurrent: number,
    private readonly maxPending: number,
  ) {}

  get active(): number {
    return this.activeCount;
  }

  get queued(): number {
    return this.pending.length;
  }

  async run<T>(operation: () => Promise<T>): Promise<T> {
    const release = await this.acquire();
    try {
      return await operation();
    } finally {
      release();
    }
  }

  private acquire(): Promise<Release> {
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount += 1;
      return Promise.resolve(this.releaseFunction());
    }
    if (this.pending.length >= this.maxPending) {
      throw new RenderCapacityExceeded();
    }
    return new Promise<Release>((resolve) => this.pending.push(resolve));
  }

  private releaseFunction(): Release {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const next = this.pending.shift();
      if (next) {
        next(this.releaseFunction());
      } else {
        this.activeCount -= 1;
      }
    };
  }
}
