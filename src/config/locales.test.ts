import { describe, expect, it } from "vitest";
import { defaultLocale, isLocale, localeLabels, locales } from "@/config/locales";

describe("locale foundation", () => {
  it("supports only English, Hindi, and Punjabi", () => {
    expect(locales).toEqual(["en", "hi", "pa"]);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("hi")).toBe(true);
    expect(isLocale("pa")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("uses English as the default language", () => {
    expect(defaultLocale).toBe("en");
  });

  it("provides a display label for every locale", () => {
    expect(Object.keys(localeLabels).sort()).toEqual(["en", "hi", "pa"]);
  });
});
