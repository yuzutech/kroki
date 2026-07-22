export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

export class TokenBucketRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly tokensPerMinute: number,
    private readonly burst: number,
    private readonly now: () => number = Date.now,
  ) {}

  consume(principal: string): RateLimitDecision {
    const currentTime = this.now();
    const bucket = this.buckets.get(principal) ?? { tokens: this.burst, updatedAt: currentTime };
    const refillPerMillisecond = this.tokensPerMinute / 60_000;
    bucket.tokens = Math.min(this.burst, bucket.tokens + (currentTime - bucket.updatedAt) * refillPerMillisecond);
    bucket.updatedAt = currentTime;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.buckets.set(principal, bucket);
      return { allowed: true, retryAfterSeconds: 0 };
    }

    this.buckets.set(principal, bucket);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((1 - bucket.tokens) / refillPerMillisecond / 1000)),
    };
  }
}
