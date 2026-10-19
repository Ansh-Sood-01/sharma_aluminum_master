import { notFound } from "next/navigation";
import GalleryExperience from "@/components/gallery/GalleryExperience";
import { business } from "@/config/business";
import { locales, isLocale } from "@/config/locales";
import { getPortfolioCategories, getPublishedProjects } from "@/lib/portfolio";

 type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const [projects] = await Promise.all([getPublishedProjects(locale, { slug })]);
  const project = projects[0];
  return project ? { title: `${project.title} | ${business.name}`, description: project.description } : { title: `Project | ${business.name}` };
}

export async function generateStaticParams() { return locales.flatMap((locale) => [{ locale, slug: "example-project" }]); }

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return notFound();
  const [projects, categories] = await Promise.all([getPublishedProjects(locale, { slug }), getPortfolioCategories(locale)]);
  const project = projects[0];
  if (!project) return notFound();
  const category = {
    slug: project.slug,
    eyebrow: project.premium ? "PREMIUM COLLECTION / PROJECT DETAIL" : "PROJECT DETAIL / SHARMA ALUMINIUM MASTER",
    title: project.title,
    intro: project.description,
    items: project.media.length ? project.media : project.coverImage ? [{ title: project.title, description: project.description, imageUrl: project.coverImage, tag: "PROJECT", alt: project.title, mediaType: "image" as const }] : [],
  };
  // Published project details must always show media supplied for that project.
  // Do not substitute unrelated reference imagery for a real project.
  if (!category.items.length) return notFound();
  const contact = business.contacts[0];
  const whatsappHref = `https://wa.me/${contact.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hello, I am interested in ${project.title}. Please contact me about measurements and a quotation.`)}`;
  return <GalleryExperience locale={locale} category={category} categoryLinks={categories.map((item) => ({ slug: item.slug, title: item.title }))} phoneHref={`tel:${contact.phoneE164}`} whatsappHref={whatsappHref} callLabel={locale === "hi" ? "टीम को कॉल करें" : locale === "pa" ? "ਟੀਮ ਨੂੰ ਕਾਲ ਕਰੋ" : "Call the team"} quoteLabel={locale === "hi" ? "कोटेशन माँगें" : locale === "pa" ? "ਕੋਟੇਸ਼ਨ ਮੰਗੋ" : "Enquire about this project"} referenceNote="Project media uploaded by the business team. Exact dimensions, materials and estimates are confirmed directly with the team." backLabel={locale === "hi" ? "होम पेज पर लौटें" : locale === "pa" ? "ਮੁੱਖ ਪੰਨੇ ਤੇ ਵਾਪਸ ਜਾਓ" : "Back to home"} demo={false} />;
}
