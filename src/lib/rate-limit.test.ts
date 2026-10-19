import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitBucketsForTests } from "@/lib/rate-limit";

beforeEach(() => resetRateLimitBucketsForTests());

describe("best-effort endpoint throttling", () => {
  it("allows requests within the configured limit", () => {
    const request = new Request("http://localhost/api", { headers: { "x-forwarded-for": "192.0.2.10" } });
    expect(checkRateLimit(request, "test", 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(request, "test", 2, 60_000).allowed).toBe(true);
  });

  it("rejects requests beyond the configured limit with a retry interval", () => {
    const request = new Request("http://localhost/api", { headers: { "x-forwarded-for": "192.0.2.11" } });
    checkRateLimit(request, "test", 1, 60_000);
    const next = checkRateLimit(request, "test", 1, 60_000);
    expect(next.allowed).toBe(false);
    expect(next.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks endpoints separately", () => {
    const request = new Request("http://localhost/api", { headers: { "x-forwarded-for": "192.0.2.12" } });
    checkRateLimit(request, "one", 1, 60_000);
    expect(checkRateLimit(request, "two", 1, 60_000).allowed).toBe(true);
  });
});
