import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { consumeRateLimit, isRateLimited, resetRateLimit } from "@/lib/rate-limit.js";

const WINDOW = { limit: 3, windowMs: 60_000 };

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("consumeRateLimit", () => {
  it("allows attempts up to the limit", () => {
    const key = `t-${Math.random()}`;
    expect(consumeRateLimit(key, WINDOW).ok).toBe(true);
    expect(consumeRateLimit(key, WINDOW).ok).toBe(true);
    expect(consumeRateLimit(key, WINDOW).ok).toBe(true);
  });

  it("blocks attempts over the limit with retryAfterSec", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 3; i++) consumeRateLimit(key, WINDOW);

    const blocked = consumeRateLimit(key, WINDOW);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it("resets after the window expires", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 4; i++) consumeRateLimit(key, WINDOW);
    expect(consumeRateLimit(key, WINDOW).ok).toBe(false);

    vi.advanceTimersByTime(61_000);
    expect(consumeRateLimit(key, WINDOW).ok).toBe(true);
  });

  it("tracks keys independently", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    for (let i = 0; i < 4; i++) consumeRateLimit(a, WINDOW);
    expect(consumeRateLimit(a, WINDOW).ok).toBe(false);
    expect(consumeRateLimit(b, WINDOW).ok).toBe(true);
  });
});

describe("isRateLimited (peek without consuming)", () => {
  it("is false below the limit and true at the limit", () => {
    const key = `t-${Math.random()}`;
    expect(isRateLimited(key)).toBe(false);

    consumeRateLimit(key, WINDOW);
    consumeRateLimit(key, WINDOW);
    expect(isRateLimited(key)).toBe(false);

    consumeRateLimit(key, WINDOW); // 3rd failure = at limit
    expect(isRateLimited(key)).toBe(true);
  });

  it("is false again after the window expires", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 3; i++) consumeRateLimit(key, WINDOW);
    expect(isRateLimited(key)).toBe(true);

    vi.advanceTimersByTime(61_000);
    expect(isRateLimited(key)).toBe(false);
  });
});

describe("resetRateLimit", () => {
  it("clears the counter (successful login resets failures)", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 3; i++) consumeRateLimit(key, WINDOW);
    expect(isRateLimited(key)).toBe(true);

    resetRateLimit(key);
    expect(isRateLimited(key)).toBe(false);
    expect(consumeRateLimit(key, WINDOW).ok).toBe(true);
  });
});
