import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdminEmailAllowlist, getSiteUrl } from "@/lib/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("environment configuration helpers", () => {
  it("uses a safe local origin when the configured URL is missing or malformed", () => {
    expect(getSiteUrl(undefined).origin).toBe("http://localhost:3000");
    expect(getSiteUrl("not a url").origin).toBe("http://localhost:3000");
  });

  it("accepts an HTTPS site URL", () => {
    expect(getSiteUrl("https://portfolio.example.org").origin).toBe(
      "https://portfolio.example.org",
    );
  });

  it("rejects insecure non-local HTTP origins", () => {
    expect(getSiteUrl("http://portfolio.example.org").origin).toBe(
      "http://localhost:3000",
    );
  });

  it("normalizes and deduplicates the administrator email allowlist", () => {
    expect(
      getAdminEmailAllowlist("Owner@business.in, owner@business.in, SECOND@business.in"),
    ).toEqual(["owner@business.in", "second@business.in"]);
  });

  it("does not treat example placeholder emails as real admin addresses", () => {
    expect(getAdminEmailAllowlist("owner@example.com, replace_with_owner@your-domain.example")).toEqual([]);
  });
});
