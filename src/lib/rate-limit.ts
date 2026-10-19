/**
 * Best-effort per-process rate limiter for low-volume public endpoints.
 * Serverless instances do not share this map. Use a managed distributed
 * limiter (for example, backed by Redis) before high-volume public promotion.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientFingerprint(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  // Never log or persist the IP. It is used only as an ephemeral throttle key.
  return forwarded || realIp || "unknown-client";
}

export function checkRateLimit(
  request: Request,
  endpoint: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const key = `${endpoint}:${clientFingerprint(request)}`;
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [bucketKey, value] of buckets) if (value.resetAt <= now) buckets.delete(bucketKey);
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test helper: clears in-memory counters without changing endpoint behavior. */
export function resetRateLimitBucketsForTests() { buckets.clear(); }
