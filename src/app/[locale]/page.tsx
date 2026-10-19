import { notFound } from "next/navigation";
import { ArrowDownRight, ArrowRight, ArrowUpRight, MessageCircle, MoveUpRight, PanelsTopLeft, Phone, Ruler, Sparkles, SquareStack, PlayCircle } from "lucide-react";
import { business, getAddressSearchUrl } from "@/config/business";
import LeadForm from "@/components/forms/LeadForm";
import { isLocale, localeLabels, locales, type Locale } from "@/config/locales";
import { getPublishedProjects } from "@/lib/portfolio";

type LocalePageProps = { params: Promise<{ locale: string }> };

type Copy = {
  nav: string[]; call: string; quote: string; eyebrow: string; titleA: string; titleB: string; intro: string;
  explore: string; scroll: string; index: string; categoriesEyebrow: string; categoriesTitle: string; categoriesBody: string;
  categories: { title: string; description: string; number: string }[]; workEyebrow: string; workTitle: string; workBody: string;
  concept: string; premiumEyebrow: string; premiumTitle: string; premiumBody: string; premiumCta: string;
  processEyebrow: string; processTitle: string; steps: { title: string; body: string }[]; contactEyebrow: string; contactTitle: string;
  contactBody: string; address: string; directions: string; email: string; footer: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    nav: ["Our work", "Services", "Premium", "About", "Contact"], call: "Call now", quote: "Request a quote",
    eyebrow: "Architectural aluminium · Glass · Interiors", titleA: "Designed for your space.", titleB: "Made for living.",
    intro: "Thoughtful aluminium, glass and interior solutions shaped around the way you live and work.", explore: "Explore our work", scroll: "Scroll to discover", index: "JALANDHAR · PUNJAB · INDIA",
    categoriesEyebrow: "What we make", categoriesTitle: "Details that define a space.", categoriesBody: "Explore the possibilities across residential and commercial installations. Our portfolio will grow as projects are added by the team.",
    categories: [
      { title: "Kitchens & cabinetry", description: "Aluminium kitchens, cupboards and almirahs designed around your storage needs.", number: "01" },
      { title: "Doors & windows", description: "Clean lines, practical frames and tailored openings for your space.", number: "02" },
      { title: "Glass & partitions", description: "Glass work, partitions and considered combinations of materials.", number: "03" },
      { title: "Commercial interiors", description: "Office fittings, racks, panels, gates, grills and custom fabrication.", number: "04" },
    ],
    workEyebrow: "Selected directions", workTitle: "A portfolio in the making.", workBody: "Real project photographs will be added here by the Sharma Aluminium Master team. The visual panels below are design placeholders, not completed customer projects.",
    concept: "DESIGN CONCEPT · SAMPLE VISUAL", premiumEyebrow: "A more considered finish", premiumTitle: "The Premium Collection", premiumBody: "A focused space for glass and aluminium combinations, profile lighting, modern partitions and refined interior details.", premiumCta: "Discover premium work",
    processEyebrow: "From first idea to fitting", processTitle: "A clear process. A personal approach.", steps: [
      { title: "Explore", body: "Browse categories and save the designs that feel right for your space." },
      { title: "Discuss", body: "Tell us about the work, your preferences and the location." },
      { title: "Measure", body: "Request a measurement visit so the team can understand the requirements." },
      { title: "Estimate", body: "Review the details and quotation with the team before confirming." },
    ],
    contactEyebrow: "Start a conversation", contactTitle: "Have a space in mind?", contactBody: "Tell us what you are planning. Call the team or send an enquiry to discuss your requirements.", address: "Visit or write to us", directions: "Find us on Google Maps", email: "Email us", footer: "Explore designs, then speak directly with the team about measurements and estimates.",
  },
  hi: {
    nav: ["हमारा काम", "सेवाएँ", "प्रीमियम", "हमारे बारे में", "संपर्क"], call: "कॉल करें", quote: "कोटेशन माँगें",
    eyebrow: "आर्किटेक्चरल एल्युमिनियम · ग्लास · इंटीरियर", titleA: "आपकी जगह के लिए डिज़ाइन।", titleB: "रोज़मर्रा के लिए तैयार।",
    intro: "आपके रहने और काम करने के तरीके के अनुरूप एल्युमिनियम, ग्लास और इंटीरियर समाधान।", explore: "हमारा काम देखें", scroll: "आगे देखें", index: "जालंधर · पंजाब · भारत",
    categoriesEyebrow: "हम क्या बनाते हैं", categoriesTitle: "जगह को खास बनाते विवरण।", categoriesBody: "घर और व्यावसायिक इंस्टॉलेशन की संभावनाएँ देखें। टीम द्वारा प्रोजेक्ट जोड़े जाने पर पोर्टफोलियो बढ़ेगा।",
    categories: [
      { title: "किचन और कैबिनेट", description: "आपकी स्टोरेज ज़रूरतों के अनुसार एल्युमिनियम किचन, कपबोर्ड और अलमारी।", number: "01" },
      { title: "दरवाज़े और खिड़कियाँ", description: "आपकी जगह के लिए साफ़ डिज़ाइन और उपयोगी फ्रेम।", number: "02" },
      { title: "ग्लास और पार्टिशन", description: "ग्लास वर्क, पार्टिशन और अलग-अलग मटेरियल का संयोजन।", number: "03" },
      { title: "कमर्शियल इंटीरियर", description: "ऑफिस फिटिंग, रैक, पैनल, गेट, ग्रिल और कस्टम फैब्रिकेशन।", number: "04" },
    ],
    workEyebrow: "चुनी हुई दिशाएँ", workTitle: "बनता हुआ पोर्टफोलियो।", workBody: "शर्मा एल्युमिनियम मास्टर की टीम यहाँ वास्तविक प्रोजेक्ट तस्वीरें जोड़ेगी। नीचे दिए गए विज़ुअल केवल डिज़ाइन नमूने हैं, ग्राहक के पूरे किए गए काम नहीं।",
    concept: "डिज़ाइन कॉन्सेप्ट · नमूना विज़ुअल", premiumEyebrow: "और भी खास फिनिश", premiumTitle: "प्रीमियम कलेक्शन", premiumBody: "ग्लास और एल्युमिनियम का संयोजन, प्रोफाइल लाइटिंग, आधुनिक पार्टिशन और इंटीरियर डिटेल्स के लिए खास जगह।", premiumCta: "प्रीमियम काम देखें",
    processEyebrow: "पहले विचार से फिटिंग तक", processTitle: "स्पष्ट प्रक्रिया। व्यक्तिगत सहयोग।", steps: [
      { title: "देखें", body: "कैटेगरी देखें और अपनी पसंद के डिज़ाइन चुनें।" }, { title: "चर्चा करें", body: "काम, पसंद और लोकेशन के बारे में बताएँ।" }, { title: "माप लें", body: "ज़रूरत समझाने के लिए माप विज़िट का अनुरोध करें।" }, { title: "अनुमान", body: "काम की पुष्टि से पहले टीम के साथ विवरण और कोटेशन देखें।" },
    ], contactEyebrow: "बात शुरू करें", contactTitle: "क्या आपके मन में कोई डिज़ाइन है?", contactBody: "अपनी योजना बताएँ। ज़रूरत पर चर्चा करने के लिए टीम को कॉल करें या पूछताछ भेजें।", address: "पता और संपर्क", directions: "Google Maps पर देखें", email: "ईमेल करें", footer: "डिज़ाइन देखें और माप व अनुमान के लिए टीम से सीधे बात करें।",
  },
  pa: {
    nav: ["ਸਾਡਾ ਕੰਮ", "ਸੇਵਾਵਾਂ", "ਪ੍ਰੀਮੀਅਮ", "ਸਾਡੇ ਬਾਰੇ", "ਸੰਪਰਕ"], call: "ਕਾਲ ਕਰੋ", quote: "ਕੋਟੇਸ਼ਨ ਮੰਗੋ",
    eyebrow: "ਆਰਕੀਟੈਕਚਰਲ ਐਲੂਮੀਨੀਅਮ · ਕੱਚ · ਇੰਟੀਰੀਅਰ", titleA: "ਤੁਹਾਡੀ ਜਗ੍ਹਾ ਲਈ ਡਿਜ਼ਾਈਨ।", titleB: "ਰੋਜ਼ਾਨਾ ਜੀਵਨ ਲਈ।",
    intro: "ਤੁਹਾਡੇ ਰਹਿਣ ਅਤੇ ਕੰਮ ਕਰਨ ਦੇ ਢੰਗ ਮੁਤਾਬਕ ਐਲੂਮੀਨੀਅਮ, ਕੱਚ ਅਤੇ ਇੰਟੀਰੀਅਰ ਹੱਲ।", explore: "ਸਾਡਾ ਕੰਮ ਵੇਖੋ", scroll: "ਅੱਗੇ ਵੇਖੋ", index: "ਜਲੰਧਰ · ਪੰਜਾਬ · ਭਾਰਤ",
    categoriesEyebrow: "ਅਸੀਂ ਕੀ ਬਣਾਉਂਦੇ ਹਾਂ", categoriesTitle: "ਜਗ੍ਹਾ ਨੂੰ ਖ਼ਾਸ ਬਣਾਉਣ ਵਾਲੇ ਵੇਰਵੇ।", categoriesBody: "ਘਰੇਲੂ ਅਤੇ ਵਪਾਰਕ ਇੰਸਟਾਲੇਸ਼ਨਾਂ ਦੀਆਂ ਸੰਭਾਵਨਾਵਾਂ ਵੇਖੋ। ਟੀਮ ਵੱਲੋਂ ਪ੍ਰੋਜੈਕਟ ਜੋੜਨ ਨਾਲ ਪੋਰਟਫੋਲੀਓ ਵਧੇਗਾ।",
    categories: [
      { title: "ਕਿਚਨ ਅਤੇ ਕੈਬਿਨੇਟ", description: "ਸਟੋਰੇਜ ਦੀਆਂ ਲੋੜਾਂ ਮੁਤਾਬਕ ਐਲੂਮੀਨੀਅਮ ਕਿਚਨ, ਕਬੱਡ ਅਤੇ ਅਲਮਾਰੀਆਂ।", number: "01" },
      { title: "ਦਰਵਾਜ਼ੇ ਅਤੇ ਖਿੜਕੀਆਂ", description: "ਤੁਹਾਡੀ ਜਗ੍ਹਾ ਲਈ ਸਾਫ਼ ਡਿਜ਼ਾਈਨ ਅਤੇ ਵਰਤੋਂਯੋਗ ਫਰੇਮ।", number: "02" },
      { title: "ਕੱਚ ਅਤੇ ਪਾਰਟੀਸ਼ਨ", description: "ਕੱਚ ਦਾ ਕੰਮ, ਪਾਰਟੀਸ਼ਨ ਅਤੇ ਵੱਖ-ਵੱਖ ਸਮੱਗਰੀਆਂ ਦਾ ਮੇਲ।", number: "03" },
      { title: "ਵਪਾਰਕ ਇੰਟੀਰੀਅਰ", description: "ਦਫ਼ਤਰੀ ਫਿਟਿੰਗ, ਰੈਕ, ਪੈਨਲ, ਗੇਟ, ਗ੍ਰਿੱਲ ਅਤੇ ਕਸਟਮ ਫੈਬ੍ਰਿਕੇਸ਼ਨ।", number: "04" },
    ],
    workEyebrow: "ਚੁਣੀਆਂ ਦਿਸ਼ਾਵਾਂ", workTitle: "ਤਿਆਰ ਹੋ ਰਿਹਾ ਪੋਰਟਫੋਲੀਓ।", workBody: "ਸ਼ਰਮਾ ਐਲੂਮੀਨੀਅਮ ਮਾਸਟਰ ਦੀ ਟੀਮ ਇੱਥੇ ਅਸਲ ਪ੍ਰੋਜੈਕਟ ਤਸਵੀਰਾਂ ਜੋੜੇਗੀ। ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਜ਼ੂਅਲ ਸਿਰਫ਼ ਡਿਜ਼ਾਈਨ ਨਮੂਨੇ ਹਨ, ਗਾਹਕਾਂ ਲਈ ਕੀਤੇ ਕੰਮ ਨਹੀਂ।",
    concept: "ਡਿਜ਼ਾਈਨ ਸੰਕਲਪ · ਨਮੂਨਾ ਵਿਜ਼ੂਅਲ", premiumEyebrow: "ਹੋਰ ਨਿਖਰੀ ਫਿਨਿਸ਼", premiumTitle: "ਪ੍ਰੀਮੀਅਮ ਕਲੈਕਸ਼ਨ", premiumBody: "ਕੱਚ ਅਤੇ ਐਲੂਮੀਨੀਅਮ ਦੇ ਮੇਲ, ਪ੍ਰੋਫਾਈਲ ਲਾਈਟਿੰਗ, ਆਧੁਨਿਕ ਪਾਰਟੀਸ਼ਨ ਅਤੇ ਇੰਟੀਰੀਅਰ ਵੇਰਵਿਆਂ ਲਈ ਖ਼ਾਸ ਜਗ੍ਹਾ।", premiumCta: "ਪ੍ਰੀਮੀਅਮ ਕੰਮ ਵੇਖੋ",
    processEyebrow: "ਪਹਿਲੇ ਵਿਚਾਰ ਤੋਂ ਫਿਟਿੰਗ ਤੱਕ", processTitle: "ਸਪਸ਼ਟ ਪ੍ਰਕਿਰਿਆ। ਨਿੱਜੀ ਸਹਿਯੋਗ।", steps: [
      { title: "ਵੇਖੋ", body: "ਸ਼੍ਰੇਣੀਆਂ ਵੇਖੋ ਅਤੇ ਪਸੰਦ ਦੇ ਡਿਜ਼ਾਈਨ ਚੁਣੋ।" }, { title: "ਗੱਲ ਕਰੋ", body: "ਕੰਮ, ਪਸੰਦ ਅਤੇ ਥਾਂ ਬਾਰੇ ਦੱਸੋ।" }, { title: "ਮਾਪ", body: "ਲੋੜਾਂ ਸਮਝਾਉਣ ਲਈ ਮਾਪ-ਮੁਲਾਂਕਣ ਵਿਜ਼ਿਟ ਮੰਗੋ।" }, { title: "ਅੰਦਾਜ਼ਾ", body: "ਕੰਮ ਪੱਕਾ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਵੇਰਵੇ ਅਤੇ ਕੋਟੇਸ਼ਨ ਬਾਰੇ ਗੱਲ ਕਰੋ।" },
    ], contactEyebrow: "ਗੱਲ ਸ਼ੁਰੂ ਕਰੋ", contactTitle: "ਕੀ ਤੁਹਾਡੇ ਮਨ ਵਿੱਚ ਕੋਈ ਡਿਜ਼ਾਈਨ ਹੈ?", contactBody: "ਆਪਣੀ ਯੋਜਨਾ ਦੱਸੋ। ਲੋੜਾਂ ਬਾਰੇ ਗੱਲ ਕਰਨ ਲਈ ਟੀਮ ਨੂੰ ਕਾਲ ਕਰੋ ਜਾਂ ਪੁੱਛਗਿੱਛ ਭੇਜੋ।", address: "ਪਤਾ ਅਤੇ ਸੰਪਰਕ", directions: "Google Maps 'ਤੇ ਵੇਖੋ", email: "ਈਮੇਲ ਕਰੋ", footer: "ਡਿਜ਼ਾਈਨ ਵੇਖੋ ਅਤੇ ਮਾਪ ਤੇ ਅੰਦਾਜ਼ੇ ਲਈ ਟੀਮ ਨਾਲ ਸਿੱਧੀ ਗੱਲ ਕਰੋ।",
  },
};

const categoryVisuals = ["visual-kitchen", "visual-frames", "visual-glass", "visual-commercial"];

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "en" ? "Sharma Aluminium Master | Architectural Aluminium & Interiors" : `${business.name} | ${localeLabels[locale]}`,
    description: copy[locale].intro,
  };
}

export default async function LocaleHomePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return notFound();
  const t = copy[locale];
  const primaryContact = business.contacts[0];
  const featuredProjects = await getPublishedProjects(locale, { featured: true });
  const featuredWorkTitle = featuredProjects.length
    ? locale === "hi" ? "चुने हुए प्रोजेक्ट" : locale === "pa" ? "ਚੁਣੇ ਹੋਏ ਪ੍ਰੋਜੈਕਟ" : "Selected projects"
    : t.workTitle;
  const featuredWorkBody = featuredProjects.length
    ? locale === "hi" ? "टीम द्वारा प्रकाशित वास्तविक प्रोजेक्ट तस्वीरें और वीडियो देखें।" : locale === "pa" ? "ਟੀਮ ਵੱਲੋਂ ਪ੍ਰਕਾਸ਼ਿਤ ਅਸਲ ਪ੍ਰੋਜੈਕਟ ਤਸਵੀਰਾਂ ਅਤੇ ਵੀਡੀਓ ਵੇਖੋ।" : "Browse photographs and videos of projects published by the team."
    : t.workBody;

  return (
    <main id="top">
      <div className="announcement"><span>{t.index}</span><span className="announcement-right">CUSTOM ALUMINIUM & INTERIORS <span className="announcement-dot" /></span></div>
      <header className="site-header">
        <a className="brand" href={`/${locale}`} aria-label={business.name}>
          <span className="brand-mark">S<span>.</span></span>
          <span className="brand-name"><strong>SHARMA</strong><small>ALUMINIUM MASTER</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#work">{t.nav[0]}</a><a href="#services">{t.nav[1]}</a><a href={`/${locale}/premium`}>{t.nav[2]}</a><a href={`/${locale}/about`}>{t.nav[3]}</a><a href={`/${locale}/contact`}>{t.nav[4]}</a>
        </nav>
        <div className="header-actions">
          <div className="language-picker" aria-label="Language selector">
            {locales.map((item) => <a key={item} href={`/${item}`} aria-current={locale === item ? "page" : undefined}>{item.toUpperCase()}</a>)}
          </div>
          <a className="header-call" href={`tel:${primaryContact.phoneE164}`}><Phone size={15} /> <span>{t.call}</span></a>
          <a className="header-quote" href={`/${locale}/contact`}>{t.quote}<ArrowUpRight size={15} /></a>
        </div>
        <details className="mobile-nav-menu"><summary aria-label="Open navigation menu">MENU</summary><div><a href="#work">{t.nav[0]}</a><a href="#services">{t.nav[1]}</a><a href={`/${locale}/premium`}>{t.nav[2]}</a><a href={`/${locale}/about`}>{t.nav[3]}</a><a href={`/${locale}/contact`}>{t.nav[4]}</a><a href={`/${locale}/gallery/windows`}>Windows & frames</a><a href={`/${locale}/gallery/kitchens-cabinetry`}>Kitchens & cabinetry</a></div></details>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />{t.eyebrow}</p>
          <h1 id="hero-title">{t.titleA}<br /><em>{t.titleB}</em></h1>
          <p className="hero-intro">{t.intro}</p>
          <div className="hero-actions"><a className="button button-dark" href="#work">{t.explore}<ArrowRight size={17} /></a><a className="text-link" href="#contact">{t.quote}<ArrowUpRight size={16} /></a></div>
          <div className="hero-foot"><span className="scroll-cue"><ArrowDownRight size={17} /> {t.scroll}</span><span className="hero-foot-index">01 / 04</span></div>
        </div>
        <div className="hero-art" aria-label="Abstract architectural aluminium and glass design concept">
          <div className="art-topline"><span>FORM / FUNCTION</span><span>01—04</span></div>
          <div className="architecture-scene">
            <div className="scene-wall" /><div className="scene-window"><div className="window-glass" /><span className="window-frame frame-v" /><span className="window-frame frame-h" /></div>
            <div className="scene-cabinet"><div /><div /><div /><div /></div><div className="scene-counter" /><div className="scene-shadow" />
          </div>
          <div className="art-caption"><span>01 — MATERIAL STUDY</span><span>ALUMINIUM / GLASS / LIGHT</span></div>
          <div className="hero-art-stamp"><span>DESIGN</span><span>THAT</span><span>FITS.</span></div>
        </div>
        <div className="hero-bottom-rule"><span>01</span><span /><span>CRAFTED AROUND YOUR SPACE</span></div>
      </section>

      <section className="intro-strip" id="about"><p className="eyebrow">{t.categoriesEyebrow}</p><p className="intro-statement">Good spaces are not just built.<br /><span>They are thought through.</span></p><p className="intro-note">{t.categoriesBody}</p></section>

      <section className="services section-pad" id="services">
        <div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" />01 / {t.categoriesEyebrow}</p><h2>{t.categoriesTitle}</h2></div><p className="section-description">{t.categoriesBody}</p></div>
        <div className="category-grid">
          {t.categories.map((category, i) => <a href={`/${locale}/gallery/${["kitchens-cabinetry", "windows", "glass-partitions", "commercial-interiors"][i]}`} className="category-card" key={category.number}>
            <div className={`category-visual ${categoryVisuals[i]}`}><span className="visual-index">{category.number} / 04</span><span className="visual-label">{i === 0 ? "CABINETRY" : i === 1 ? "FRAME SYSTEM" : i === 2 ? "GLASS STUDY" : "WORKSPACE"}</span><span className="visual-object" /><span className="visual-object-secondary" /></div>
            <div className="category-meta"><span>{category.number}</span><ArrowUpRight size={18} /></div><h3>{category.title}</h3><p>{category.description}</p>
          </a>)}
        </div>
      </section>

      <section className="all-categories-strip" aria-label="All portfolio categories"><div><p className="eyebrow">THE FULL SHOWROOM</p><h2>Find the category<br /><em>for your project.</em></h2></div><div className="all-category-links">{[{slug:"kitchens-cabinetry",name:"Kitchens & cabinetry"},{slug:"cupboards-almirahs",name:"Cupboards & almirahs"},{slug:"doors",name:"Aluminium doors"},{slug:"windows",name:"Windows & frames"},{slug:"sheets-panels",name:"Sheets & panels"},{slug:"commercial-interiors",name:"Office & commercial"},{slug:"racks-storage",name:"Racks & storage"},{slug:"gates-grills-fabrication",name:"Gates & fabrication"},{slug:"glass-partitions",name:"Glass & partitions"},{slug:"premium-collection",name:"Premium collection"}].map((item,i)=><a key={item.slug} href={`/${locale}/gallery/${item.slug}`}><span>{String(i+1).padStart(2,"0")}</span><strong>{item.name}</strong><ArrowUpRight size={16}/></a>)}</div></section>

      <section className="work-section section-pad" id="work">
        <div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" />02 / {t.workEyebrow}</p><h2>{featuredWorkTitle}</h2><a className="gallery-index-link" href={`/${locale}/gallery/windows`}>Browse category galleries <ArrowRight size={15} /></a></div><p className="section-description">{featuredWorkBody}</p></div>
        {featuredProjects.length > 0 ? <div className="published-projects-grid">{featuredProjects.map((project, index) => {
          const firstMedia = project.media[0];
          const cover = project.coverImage || firstMedia?.imageUrl;
          const coverIsVideo = !project.coverImage && firstMedia?.mediaType === "video";
          return <a className="published-project-card" href={`/${locale}/project/${project.slug}`} key={project.id}>
            <span className="published-project-image">{cover ? coverIsVideo ? <video src={cover} muted playsInline preload="metadata" /> : <img src={cover} alt={project.title} loading="lazy" /> : <span className="published-project-no-image">SHARMA / DETAIL STUDY</span>}{project.media.some((item) => item.mediaType === "video") && <span className="project-video-badge"><PlayCircle size={15} /> Video</span>}<span className="published-project-index">{String(index + 1).padStart(2, "0")}</span></span>
            <span className="published-project-meta"><span><small>{project.premium ? "PREMIUM COLLECTION" : project.categorySlug.replaceAll("-", " ").toUpperCase()}</small><strong>{project.title}</strong><em>{project.description}</em></span><span className="published-project-arrow"><ArrowUpRight size={19} /></span></span>
          </a>;
        })}</div> : <div className="work-grid">
          <article className="work-feature"><div className="work-art work-art-one"><div className="work-room"><div className="room-back" /><div className="room-cabinet"><span /><span /><span /><span /><span /></div><div className="room-island" /></div><span className="sample-badge">{t.concept}</span></div><div className="work-caption"><div><span className="work-number">01 / CONCEPT VISUAL</span><h3>Material & proportion</h3></div><a className="work-arrow" href={`/${locale}/gallery/kitchens-cabinetry`} aria-label="Explore kitchens and cabinetry gallery"><ArrowUpRight size={20} /></a></div></article>
          <article className="work-secondary"><div className="work-art work-art-two"><div className="panel-study"><span /><span /><span /><span /></div><div className="light-study" /><span className="sample-badge">{t.concept}</span></div><div className="work-caption"><div><span className="work-number">02 / CONCEPT VISUAL</span><h3>Light, line & finish</h3></div><a className="work-arrow" href={`/${locale}/gallery/glass-partitions`} aria-label="Explore glass and partitions gallery"><ArrowUpRight size={20} /></a></div></article>
        </div>}
      </section>

      <section className="premium-section" id="premium"><div className="premium-grid"><div className="premium-art"><div className="premium-glass" /><div className="premium-light-line" /><div className="premium-frame" /><span className="premium-art-label">P / 01 — LIGHT IN MATERIAL</span></div><div className="premium-copy"><p className="eyebrow eyebrow-light"><span className="eyebrow-line" />03 / {t.premiumEyebrow}</p><h2>{t.premiumTitle.split(" ").slice(0, -1).join(" ")}<br /><em>{t.premiumTitle.split(" ").slice(-1)}</em></h2><p>{t.premiumBody}</p><a href={`/${locale}/premium`} className="button button-light">{t.premiumCta}<ArrowUpRight size={17} /></a><span className="premium-note"><Sparkles size={15} /> GLASS · ALUMINIUM · PROFILE LIGHTING</span></div></div></section>

      <section className="process-section section-pad" id="process"><div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" />04 / {t.processEyebrow}</p><h2>{t.processTitle}</h2></div><Ruler className="process-icon" strokeWidth={1} /></div><div className="process-grid">{t.steps.map((step, i) => <article className="process-step" key={step.title}><span className="step-number">0{i + 1}</span><div className="step-icon">{i === 0 ? <PanelsTopLeft /> : i === 1 ? <MessageCircle /> : i === 2 ? <Ruler /> : <SquareStack />}</div><h3>{step.title}</h3><p>{step.body}</p>{i < t.steps.length - 1 && <ArrowRight className="step-arrow" size={18} />}</article>)}</div></section>

      <section className="contact-section" id="contact"><div className="contact-main"><p className="eyebrow eyebrow-light"><span className="eyebrow-line" />{t.contactEyebrow}</p><h2>{t.contactTitle}</h2><p>{t.contactBody}</p><div className="contact-actions"><a className="button button-light" href={`tel:${primaryContact.phoneE164}`}><Phone size={17} /> {t.call}: {primaryContact.displayPhone}</a><a className="contact-text-link" href={`https://wa.me/${primaryContact.phoneE164.replace("+", "")}?text=${encodeURIComponent("Hello, I would like to discuss an aluminium work requirement.")}`} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp <ArrowUpRight size={15} /></a></div></div><aside className="contact-details"><p className="contact-label">{t.address}</p><h3>{business.name}</h3><p>{business.address}</p><a href={getAddressSearchUrl()} target="_blank" rel="noreferrer" className="contact-detail-link">{t.directions}<MoveUpRight size={15} /></a><div className="contact-divider" /><p className="contact-label">{t.email}</p><a href={`mailto:${business.email}`} className="contact-email">{business.email}</a><div className="contact-divider" />{business.contacts.map((contact) => <div className="contact-person" key={contact.id}><span>{contact.name}</span><a href={`tel:${contact.phoneE164}`}>{contact.displayPhone}<ArrowUpRight size={13} /></a></div>)}</aside></section>

      <section className="home-enquiry-section" id="quote-request"><div className="home-enquiry-heading"><p className="eyebrow"><span className="eyebrow-line" />LET'S PLAN THE NEXT STEP</p><h2>Tell us what<br /><em>you have in mind.</em></h2><p>Share a few details about the work. For measurement visits, include the site address and preferred date so the team can follow up.</p><a className="text-link" href={`/${locale}/contact?type=site_visit`}>Request a measurement visit <ArrowUpRight size={16}/></a></div><div className="home-enquiry-form"><LeadForm locale={locale} type="quote" title={locale === "hi" ? "कोटेशन का अनुरोध" : locale === "pa" ? "ਕੋਟੇਸ਼ਨ ਦੀ ਬੇਨਤੀ" : "Request a quotation"} description={locale === "hi" ? "आपकी ज़रूरत की शुरुआती जानकारी बताएँ।" : locale === "pa" ? "ਆਪਣੀ ਲੋੜ ਬਾਰੇ ਮੁੱਢਲੀ ਜਾਣਕਾਰੀ ਦਿਓ।" : "Start with the basics. The team can confirm scope and measurements with you."}/></div></section>

      <footer className="site-footer"><a className="brand brand-footer" href={`/${locale}`}><span className="brand-mark">S<span>.</span></span><span className="brand-name"><strong>SHARMA</strong><small>ALUMINIUM MASTER</small></span></a><p>{t.footer}</p><div className="footer-right"><span>JALANDHAR, INDIA</span><a href={`/${locale}/privacy`}>PRIVACY</a><a href={`/${locale}/terms`}>TERMS</a><a href="#top" aria-label="Back to top">BACK TO TOP ↑</a></div></footer>
    </main>
  );
}
