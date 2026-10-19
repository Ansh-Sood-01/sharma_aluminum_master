import { createClient } from "@supabase/supabase-js";
import { galleryCategories as demoCategories, type GalleryCategory, type GalleryItem } from "@/config/gallery";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export type PortfolioProject = {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  coverImage: string | null;
  featured: boolean;
  premium: boolean;
  media: GalleryItem[];
};

export type PortfolioCategory = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string | null;
};

const localeName = (rows: Array<{ locale: string; title: string; description?: string | null }> | null | undefined, locale: string, fallback: string) => {
  const found = rows?.find((row) => row.locale === locale) ?? rows?.find((row) => row.locale === "en");
  return found?.title || fallback;
};
const localeDescription = (rows: Array<{ locale: string; title: string; description?: string | null }> | null | undefined, locale: string, fallback: string) => {
  const found = rows?.find((row) => row.locale === locale) ?? rows?.find((row) => row.locale === "en");
  return found?.description || fallback;
};

function publicClient() {
  if (!hasSupabasePublicConfig()) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getPortfolioCategories(locale: string): Promise<PortfolioCategory[]> {
  const supabase = publicClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("categories").select("id, slug, cover_image_url, category_translations(locale,title,description)").eq("active", true).order("sort_order", { ascending: true });
      if (!error && data?.length) return data.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: localeName(row.category_translations as never, locale, row.slug.replaceAll("-", " ")),
        description: localeDescription(row.category_translations as never, locale, "Explore related aluminium and interior work."),
        coverImage: row.cover_image_url,
      }));
    } catch { /* Continue with clearly labelled demonstration categories. */ }
  }
  return demoCategories.map((category) => ({ slug: category.slug, title: category.title, description: category.intro, coverImage: category.items[0]?.imageUrl ?? null }));
}

export async function getPublishedProjects(locale: string, options?: { categorySlug?: string; featured?: boolean; premium?: boolean; slug?: string }): Promise<PortfolioProject[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  try {
    let query = supabase.from("projects").select(`id,slug,category_id,cover_image_url,featured,premium,categories(slug),project_translations(locale,title,description),project_media(position,media_assets(url,resource_type,title,description,alt_text))`).eq("published", true);
    if (options?.featured) query = query.eq("featured", true);
    if (options?.premium) query = query.eq("premium", true);
    if (options?.slug) query = query.eq("slug", options.slug);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error || !data) return [];
    const rows = data as unknown as Array<Record<string, unknown>>;
    return rows.filter((row) => {
      const category = row.categories as { slug?: string } | null;
      return !options?.categorySlug || category?.slug === options.categorySlug;
    }).map((row) => {
      const translations = row.project_translations as Array<{ locale: string; title: string; description?: string | null }> | null;
      const category = row.categories as { slug?: string } | null;
      const media = (row.project_media as Array<{ position: number; media_assets: { url: string; resource_type: string; title?: string | null; description?: string | null; alt_text?: string | null } | null }> | null ?? [])
        .filter((entry) => Boolean(entry.media_assets?.url))
        .sort((a, b) => a.position - b.position)
        .map((entry) => ({
          title: entry.media_assets?.title || localeName(translations, locale, String(row.slug)),
          description: entry.media_assets?.description || localeDescription(translations, locale, "Project media."),
          imageUrl: entry.media_assets!.url,
          tag: entry.media_assets?.resource_type === "video" ? "VIDEO" : "PROJECT",
          mediaType: entry.media_assets?.resource_type === "video" ? "video" as const : "image" as const,
          alt: entry.media_assets?.alt_text || entry.media_assets?.title || String(row.slug),
        }));
      const coverImage = row.cover_image_url as string | null;
      if (coverImage && !media.some((item) => item.imageUrl === coverImage)) media.unshift({ title: localeName(translations, locale, String(row.slug)), description: localeDescription(translations, locale, "Project cover."), imageUrl: coverImage, tag: "PROJECT", mediaType: "image", alt: localeName(translations, locale, String(row.slug)) });
      return {
        id: String(row.id), slug: String(row.slug), categorySlug: category?.slug ?? "", title: localeName(translations, locale, String(row.slug)),
        description: localeDescription(translations, locale, "Project details are available on request."), coverImage, featured: Boolean(row.featured), premium: Boolean(row.premium), media,
      };
    });
  } catch {
    return [];
  }
}

export function getDemoCategory(slug: string): GalleryCategory | undefined {
  return demoCategories.find((category) => category.slug === slug);
}
