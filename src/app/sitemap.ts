import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { galleryCategories } from "@/config/gallery";
import { locales } from "@/config/locales";
import { getPublishedProjects } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl().origin;
  const now = new Date();
  const staticPages = ["", "/about", "/contact", "/premium", "/privacy", "/terms"];
  const pages: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPages) {
      pages.push({ url: `${origin}/${locale}${path}`, lastModified: now, changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : 0.5 });
    }
    for (const category of galleryCategories) {
      pages.push({ url: `${origin}/${locale}/gallery/${category.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    }
    const projects = await getPublishedProjects(locale);
    for (const project of projects) {
      pages.push({ url: `${origin}/${locale}/project/${project.slug}`, lastModified: now, changeFrequency: "monthly", priority: project.featured ? 0.8 : 0.6 });
    }
  }
  return pages;
}
