import { notFound } from "next/navigation";
import GalleryExperience from "@/components/gallery/GalleryExperience";
import { galleryCategories, getGalleryCategory, type GalleryCategory } from "@/config/gallery";
import { business } from "@/config/business";
import { isLocale, locales } from "@/config/locales";
import { getPortfolioCategories, getPublishedProjects } from "@/lib/portfolio";
import PublishedProjectsGrid from "@/components/gallery/PublishedProjectsGrid";

 type Props = { params: Promise<{ locale: string; category: string }> };

const words = {
  en: { call: "Call the team", quote: "Discuss this design", back: "Back to home", referenceNote: "These are sample reference visuals for exploring a style direction. They are not represented as completed projects by Sharma Aluminium Master. Replace them with the business's own photographs before launch.", categoryNames: ["Kitchens & cabinetry", "Cupboards & almirahs", "Aluminium doors", "Windows & frames", "Sheets & panels", "Office & commercial", "Racks & storage", "Gates & fabrication", "Glass & partitions", "Premium collection"], noProjects: "No published projects in this category yet. The team can add them from the admin dashboard." },
  hi: { call: "टीम को कॉल करें", quote: "इस डिज़ाइन पर बात करें", back: "होम पेज पर लौटें", referenceNote: "ये स्टाइल की दिशा समझने के लिए नमूना रेफरेंस विज़ुअल हैं। इन्हें शर्मा एल्युमिनियम मास्टर के पूरे किए गए प्रोजेक्ट के रूप में नहीं दिखाया गया है। लॉन्च से पहले इन्हें व्यवसाय की अपनी तस्वीरों से बदलें।", categoryNames: ["किचन और कैबिनेट", "कपबर्ड और अलमारी", "एल्युमिनियम दरवाज़े", "खिड़कियाँ और फ्रेम", "शीट और पैनल", "ऑफिस और कमर्शियल", "रैक और स्टोरेज", "गेट और फैब्रिकेशन", "ग्लास और पार्टिशन", "प्रीमियम कलेक्शन"], noProjects: "इस श्रेणी में अभी प्रकाशित प्रोजेक्ट नहीं हैं। टीम उन्हें एडमिन डैशबोर्ड से जोड़ सकती है।" },
  pa: { call: "ਟੀਮ ਨੂੰ ਕਾਲ ਕਰੋ", quote: "ਇਸ ਡਿਜ਼ਾਈਨ ਬਾਰੇ ਗੱਲ ਕਰੋ", back: "ਮੁੱਖ ਪੰਨੇ ਤੇ ਵਾਪਸ ਜਾਓ", referenceNote: "ਇਹ ਸਟਾਈਲ ਦੀ ਦਿਸ਼ਾ ਸਮਝਣ ਲਈ ਨਮੂਨਾ ਰੈਫਰੈਂਸ ਵਿਜ਼ੂਅਲ ਹਨ। ਇਹ ਸ਼ਰਮਾ ਐਲੂਮੀਨੀਅਮ ਮਾਸਟਰ ਦੇ ਮੁਕੰਮਲ ਪ੍ਰੋਜੈਕਟ ਨਹੀਂ ਹਨ। ਲਾਂਚ ਤੋਂ ਪਹਿਲਾਂ ਇਨ੍ਹਾਂ ਨੂੰ ਕਾਰੋਬਾਰ ਦੀਆਂ ਆਪਣੀਆਂ ਤਸਵੀਰਾਂ ਨਾਲ ਬਦਲੋ।", categoryNames: ["ਕਿਚਨ ਅਤੇ ਕੈਬਿਨੇਟ", "ਕਬੱਡ ਅਤੇ ਅਲਮਾਰੀਆਂ", "ਐਲੂਮੀਨੀਅਮ ਦਰਵਾਜ਼ੇ", "ਖਿੜਕੀਆਂ ਅਤੇ ਫਰੇਮ", "ਸ਼ੀਟ ਅਤੇ ਪੈਨਲ", "ਦਫ਼ਤਰ ਅਤੇ ਕਮਰਸ਼ੀਅਲ", "ਰੈਕ ਅਤੇ ਸਟੋਰੇਜ", "ਗੇਟ ਅਤੇ ਫੈਬ੍ਰਿਕੇਸ਼ਨ", "ਕੱਚ ਅਤੇ ਪਾਰਟੀਸ਼ਨ", "ਪ੍ਰੀਮੀਅਮ ਕਲੈਕਸ਼ਨ"], noProjects: "ਇਸ ਸ਼੍ਰੇਣੀ ਵਿੱਚ ਹਾਲੇ ਕੋਈ ਪ੍ਰਕਾਸ਼ਿਤ ਪ੍ਰੋਜੈਕਟ ਨਹੀਂ ਹੈ। ਟੀਮ ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ ਤੋਂ ਜੋੜ ਸਕਦੀ ਹੈ।" },
} as const;

export function generateStaticParams() { return locales.flatMap((locale) => galleryCategories.map((category) => ({ locale, category: category.slug }))); }

export async function generateMetadata({ params }: Props) {
  const { locale, category: slug } = await params;
  if (!isLocale(locale)) return {};
  const entry = getGalleryCategory(slug);
  if (!entry) return { title: `Gallery | ${business.name}` };
  return { title: `${entry.title} | ${business.name}`, description: entry.intro };
}

export default async function GalleryPage({ params }: Props) {
  const { locale, category: slug } = await params;
  if (!isLocale(locale)) return notFound();
  const [dbCategories, projects] = await Promise.all([getPortfolioCategories(locale), getPublishedProjects(locale, { categorySlug: slug })]);
  const dbCategory = dbCategories.find((item) => item.slug === slug);
  const demoCategory = getGalleryCategory(slug);
  if (!demoCategory && !dbCategory) return notFound();
  const t = words[locale];
  const category: GalleryCategory = demoCategory ? { ...demoCategory, title: dbCategory?.title || t.categoryNames[galleryCategories.findIndex((item) => item.slug === slug)] || demoCategory.title, intro: dbCategory?.description || demoCategory.intro } : { slug, eyebrow: "EXPLORE OUR WORK", title: dbCategory!.title, intro: dbCategory!.description, items: [] };
  const mainPhone = business.contacts[0];
  const message = `Hello, I am interested in ${category.title.toLowerCase()}. I would like to discuss designs, measurements and an estimate.`;
  const whatsappHref = `https://wa.me/${mainPhone.phoneE164.replace("+", "")}?text=${encodeURIComponent(message)}`;
  const links = dbCategories.map((item) => ({ slug: item.slug, title: item.title }));
  const displayCategoryLinks = links.length ? links : galleryCategories.map((item, index) => ({ slug: item.slug, title: t.categoryNames[index] || item.title }));

  return <>
    <GalleryExperience locale={locale} category={category} categoryLinks={displayCategoryLinks} phoneHref={`tel:${mainPhone.phoneE164}`} whatsappHref={whatsappHref} callLabel={t.call} quoteLabel={t.quote} referenceNote={demoCategory ? t.referenceNote : t.noProjects} backLabel={t.back} />
    {projects.length > 0 && <PublishedProjectsGrid locale={locale} projects={projects} title={locale === "hi" ? "प्रकाशित प्रोजेक्ट" : locale === "pa" ? "ਪ੍ਰਕਾਸ਼ਿਤ ਪ੍ਰੋਜੈਕਟ" : "Completed project gallery"} description={locale === "hi" ? "एडमिन टीम द्वारा जोड़ी गई तस्वीरें और वीडियो देखें।" : locale === "pa" ? "ਐਡਮਿਨ ਟੀਮ ਵੱਲੋਂ ਜੋੜੀਆਂ ਤਸਵੀਰਾਂ ਅਤੇ ਵੀਡੀਓ ਵੇਖੋ।" : "Browse the photographs and videos added by the business team."} />}
    {projects.length === 0 && !demoCategory && <section className="empty-category-panel"><h2>{t.noProjects}</h2><a className="button button-dark" href={`/${locale}/contact`}>{t.quote}</a></section>}
  </>;
}
