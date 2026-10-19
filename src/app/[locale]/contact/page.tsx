import { notFound } from "next/navigation";
import { Mail, MapPin, MessageCircle, Phone, Ruler } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";
import { PublicPageShell } from "@/components/layout/PublicPageChrome";
import { business, getAddressSearchUrl, getDirectionsUrl } from "@/config/business";
import { isLocale } from "@/config/locales";
import { getPortfolioCategories } from "@/lib/portfolio";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string; project?: string }> };
export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params; const query = await searchParams;
  if (!isLocale(locale)) return notFound();
  const type = query.type === "site_visit" ? "site_visit" : query.type === "callback" ? "callback" : "quote";
  const phone = business.contacts[0];
  const categories = await getPortfolioCategories(locale);
  const selected = categories.find((item) => item.slug === query.project);
  const copy = {
    en: { eyebrow: "LET'S TALK ABOUT YOUR SPACE", title: "Start with a conversation.", intro: "Tell us what you have in mind. Measurements, materials and final estimates are confirmed with the team directly.", formTitle: type === "site_visit" ? "Request a measurement visit" : type === "callback" ? "Request a callback" : "Request a quotation", formBody: "Your request is sent to the team when the connected enquiry service is configured.", address: "Shop address", details: "Contact the team directly", map: "Open address in Google Maps", directions: "Get directions", visit: "Request a site measurement" },
    hi: { eyebrow: "अपनी जगह के बारे में बात करें", title: "बातचीत से शुरुआत करें।", intro: "अपनी योजना बताएँ। माप, सामग्री और अंतिम अनुमान की पुष्टि टीम सीधे करेगी।", formTitle: type === "site_visit" ? "माप विज़िट का अनुरोध" : type === "callback" ? "कॉलबैक का अनुरोध" : "कोटेशन का अनुरोध", formBody: "कनेक्टेड पूछताछ सेवा कॉन्फ़िगर होने पर आपका अनुरोध टीम को भेजा जाएगा।", address: "दुकान का पता", details: "टीम से सीधे संपर्क करें", map: "Google Maps पर पता खोलें", directions: "दिशा-निर्देश लें", visit: "साइट माप का अनुरोध" },
    pa: { eyebrow: "ਆਪਣੀ ਜਗ੍ਹਾ ਬਾਰੇ ਗੱਲ ਕਰੀਏ", title: "ਗੱਲਬਾਤ ਨਾਲ ਸ਼ੁਰੂ ਕਰੋ।", intro: "ਆਪਣੀ ਯੋਜਨਾ ਦੱਸੋ। ਮਾਪ, ਸਮੱਗਰੀ ਅਤੇ ਅੰਤਿਮ ਅੰਦਾਜ਼ੇ ਦੀ ਪੁਸ਼ਟੀ ਟੀਮ ਸਿੱਧੇ ਕਰੇਗੀ।", formTitle: type === "site_visit" ? "ਮਾਪ ਲਈ ਦੌਰੇ ਦੀ ਬੇਨਤੀ" : type === "callback" ? "ਕਾਲਬੈਕ ਦੀ ਬੇਨਤੀ" : "ਕੋਟੇਸ਼ਨ ਦੀ ਬੇਨਤੀ", formBody: "ਜਦੋਂ ਪੁੱਛਗਿੱਛ ਸੇਵਾ ਕਨਫ਼ਿਗਰ ਹੋਵੇਗੀ, ਤੁਹਾਡੀ ਬੇਨਤੀ ਟੀਮ ਨੂੰ ਭੇਜੀ ਜਾਵੇਗੀ।", address: "ਦੁਕਾਨ ਦਾ ਪਤਾ", details: "ਟੀਮ ਨਾਲ ਸਿੱਧਾ ਸੰਪਰਕ ਕਰੋ", map: "Google Maps ਵਿੱਚ ਪਤਾ ਖੋਲ੍ਹੋ", directions: "ਰਸਤਾ ਲਵੋ", visit: "ਸਾਈਟ ਮਾਪ ਦੀ ਬੇਨਤੀ" },
  }[locale];
  return <PublicPageShell locale={locale} eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}><section className="contact-page-grid"><div className="contact-page-details"><p className="eyebrow"><span className="eyebrow-line" />{copy.details}</p><div className="contact-info-card"><span><MapPin size={19} /></span><div><strong>{copy.address}</strong><p>{business.address}</p><a href={getAddressSearchUrl()} target="_blank" rel="noreferrer">{copy.map} ↗</a><a href={getDirectionsUrl()} target="_blank" rel="noreferrer">{copy.directions} ↗</a></div></div>{business.contacts.map((person) => <div className="contact-info-card" key={person.id}><span><Phone size={19} /></span><div><strong>{person.name}</strong><p>{person.displayPhone}</p><a href={`tel:${person.phoneE164}`}>Call {person.displayPhone} ↗</a><a href={`https://wa.me/${person.phoneE164.replace("+", "")}`} target="_blank" rel="noreferrer"><MessageCircle size={13} /> WhatsApp ↗</a></div></div>)}<div className="contact-info-card"><span><Mail size={19} /></span><div><strong>Email</strong><p>{business.email}</p><a href={`mailto:${business.email}`}>Send email ↗</a></div></div><a className="contact-measure-cta" href={`/${locale}/contact?type=site_visit`}><Ruler size={18} /><span><strong>{copy.visit}</strong><small>Share your location and a preferred date.</small></span></a></div><div className="contact-form-card">{selected && <div className="selected-project-banner"><small>ENQUIRY ABOUT</small><strong>{selected.title}</strong><span>{selected.description}</span></div>}<p className="eyebrow"><span className="eyebrow-line" />SEND A REQUEST</p><h2>{copy.formTitle}</h2><p>{copy.formBody}</p><LeadForm locale={locale} type={type} projectSlug={query.project} /></div></section></PublicPageShell>;
}
