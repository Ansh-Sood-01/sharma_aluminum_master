import { describe, expect, it } from "vitest";
import { galleryCategories, getGalleryCategory } from "@/config/gallery";

describe("portfolio category configuration", () => {
  it("has unique URL-safe category slugs", () => {
    const slugs = galleryCategories.map((category) => category.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("provides a dedicated windows gallery with reference-labelled entries", () => {
    const category = getGalleryCategory("windows");
    expect(category?.title).toMatch(/windows/i);
    expect(category?.items.length).toBeGreaterThan(0);
    expect(category?.items.every((item) => Boolean(item.title && item.imageUrl && item.alt))).toBe(true);
  });

  it("includes the main categories linked from the homepage", () => {
    const slugs = new Set(galleryCategories.map((category) => category.slug));
    for (const slug of ["kitchens-cabinetry", "windows", "glass-partitions", "commercial-interiors"]) {
      expect(slugs.has(slug)).toBe(true);
    }
  });
});
