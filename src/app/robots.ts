import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl().origin;
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/en/", "/hi/", "/pa/"], disallow: ["/admin", "/api/"] },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
