// Simple in-memory fixed-window rate limiter.
// Sufficient for the single-instance MVP deployment — counters are
// per-process and reset on restart. Swap for a shared store (e.g. Redis)
// when running multiple instances.

const buckets = new Map();
const MAX_BUCKETS = 10_000;

// Drop expired buckets once the map grows large, so the limiter cannot
// leak memory under key churn (e.g. many distinct IPs).
function sweep(now) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

/**
 * Consume one attempt for the key.
 * Returns { ok: true } while within the limit, otherwise
 * { ok: false, retryAfterSec }.
 */
export function consumeRateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, limit, resetAt: now + windowMs });
    return { ok: true };
  }

  bucket.count += 1;
  bucket.limit = limit;
  if (bucket.count > bucket.limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true };
}

/**
 * Check whether the key is currently blocked WITHOUT consuming an attempt.
 * Use together with consume-on-failure (e.g. login: only failed attempts
 * count against the limit).
 */
export function isRateLimited(key) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) return false;
  return bucket.count >= bucket.limit;
}

/** Clear the counter for a key (e.g. after a successful login). */
export function resetRateLimit(key) {
  buckets.delete(key);
}

/** Best-effort client IP for keying anonymous endpoints. */
export function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}
