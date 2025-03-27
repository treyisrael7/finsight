interface RateLimitEntry {
  attempts: number;
  timestamp: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry>;
  private maxAttempts: number;
  private windowMs: number;

  constructor() {
    this.attempts = new Map();
    this.maxAttempts = Number(process.env.NEXT_PUBLIC_RATE_LIMIT_MAX) || 5;
    this.windowMs = Number(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS) || 60000;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry) {
      this.attempts.set(identifier, {
        attempts: 1,
        timestamp: now,
      });
      return false;
    }

    // Reset if window has passed
    if (now - entry.timestamp > this.windowMs) {
      this.attempts.set(identifier, {
        attempts: 1,
        timestamp: now,
      });
      return false;
    }

    // Increment attempts
    entry.attempts += 1;
    this.attempts.set(identifier, entry);

    // Check if rate limited
    if (entry.attempts >= this.maxAttempts) {
      return true;
    }

    return false;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Create a singleton instance
export const rateLimiter = new RateLimiter(); 