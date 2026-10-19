"use client";

import { useState } from "react";
import { LoaderCircle, Send, CheckCircle2 } from "lucide-react";

export type LeadType = "quote" | "project" | "general" | "callback" | "site_visit";

type Props = {
  locale?: "en" | "hi" | "pa";
  type?: LeadType;
  projectSlug?: string;
  compact?: boolean;
  title?: string;
  description?: string;
};

const labels = {
  en: { name: "Your name", phone: "Phone number", email: "Email (optional)", service: "What do you need?", message: "Tell us a little about the work", address: "Site address / area", date: "Preferred date", time: "Preferred time", submit: "Send request", sending: "Sending…", ok: "Your request has been received. The team will review it and contact you.", fail: "We could not save your request. Please call or WhatsApp the team instead.", required: "Please enter your name, phone number and requirement.", contact: "Preferred contact", phoneContact: "Phone call", whatsapp: "WhatsApp", emailContact: "Email", placeholderService: "Select a service", services: ["Aluminium kitchen", "Cupboard / almirah", "Doors", "Windows / frames", "Glass / partitions", "Office / commercial", "Racks / storage", "Gates / grills", "Other"] },
  hi: { name: "आपका नाम", phone: "फ़ोन नंबर", email: "ईमेल (वैकल्पिक)", service: "आपको किस काम की ज़रूरत है?", message: "काम के बारे में थोड़ा बताएँ", address: "साइट का पता / क्षेत्र", date: "पसंदीदा तारीख", time: "पसंदीदा समय", submit: "अनुरोध भेजें", sending: "भेज रहे हैं…", ok: "आपका अनुरोध मिल गया है। टीम इसकी समीक्षा करके आपसे संपर्क करेगी।", fail: "अनुरोध सेव नहीं हो सका। कृपया टीम को कॉल या WhatsApp करें।", required: "कृपया नाम, फ़ोन नंबर और ज़रूरत भरें।", contact: "संपर्क का तरीका", phoneContact: "फ़ोन कॉल", whatsapp: "WhatsApp", emailContact: "ईमेल", placeholderService: "सेवा चुनें", services: ["एल्युमिनियम किचन", "कपबोर्ड / अलमारी", "दरवाज़े", "खिड़कियाँ / फ्रेम", "ग्लास / पार्टिशन", "ऑफिस / कमर्शियल", "रैक / स्टोरेज", "गेट / ग्रिल", "अन्य"] },
  pa: { name: "ਤੁਹਾਡਾ ਨਾਮ", phone: "ਫ਼ੋਨ ਨੰਬਰ", email: "ਈਮੇਲ (ਵਿਕਲਪਿਕ)", service: "ਤੁਹਾਨੂੰ ਕਿਹੜੇ ਕੰਮ ਦੀ ਲੋੜ ਹੈ?", message: "ਕੰਮ ਬਾਰੇ ਥੋੜ੍ਹਾ ਦੱਸੋ", address: "ਸਾਈਟ ਦਾ ਪਤਾ / ਇਲਾਕਾ", date: "ਪਸੰਦੀਦਾ ਤਾਰੀਖ", time: "ਪਸੰਦੀਦਾ ਸਮਾਂ", submit: "ਬੇਨਤੀ ਭੇਜੋ", sending: "ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…", ok: "ਤੁਹਾਡੀ ਬੇਨਤੀ ਮਿਲ ਗਈ ਹੈ। ਟੀਮ ਸਮੀਖਿਆ ਕਰਕੇ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੇਗੀ।", fail: "ਬੇਨਤੀ ਸੇਵ ਨਹੀਂ ਹੋਈ। ਕਿਰਪਾ ਕਰਕੇ ਟੀਮ ਨੂੰ ਕਾਲ ਜਾਂ WhatsApp ਕਰੋ।", required: "ਕਿਰਪਾ ਕਰਕੇ ਨਾਮ, ਫ਼ੋਨ ਨੰਬਰ ਅਤੇ ਲੋੜ ਭਰੋ।", contact: "ਸੰਪਰਕ ਦਾ ਤਰੀਕਾ", phoneContact: "ਫ਼ੋਨ ਕਾਲ", whatsapp: "WhatsApp", emailContact: "ਈਮੇਲ", placeholderService: "ਸੇਵਾ ਚੁਣੋ", services: ["ਐਲੂਮੀਨੀਅਮ ਕਿਚਨ", "ਕਬੱਡ / ਅਲਮਾਰੀ", "ਦਰਵਾਜ਼ੇ", "ਖਿੜਕੀਆਂ / ਫਰੇਮ", "ਕੱਚ / ਪਾਰਟੀਸ਼ਨ", "ਦਫ਼ਤਰ / ਕਮਰਸ਼ੀਅਲ", "ਰੈਕ / ਸਟੋਰੇਜ", "ਗੇਟ / ਗ੍ਰਿੱਲ", "ਹੋਰ"] },
} as const;

export default function LeadForm({ locale = "en", type = "quote", projectSlug, compact = false, title, description }: Props) {
  const t = labels[locale];
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    if (!String(payload.name ?? "").trim() || !String(payload.phone ?? "").trim() || !String(payload.message ?? "").trim()) {
      setState({ ok: false, message: t.required });
      return;
    }
    setBusy(true); setState(null);
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, type, locale, projectSlug }) });
      const result = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || t.fail);
      setState({ ok: true, message: result.message || t.ok });
      form.reset();
    } catch (error) {
      setState({ ok: false, message: error instanceof Error ? error.message : t.fail });
    } finally { setBusy(false); }
  }

  return (
    <form className={`lead-form${compact ? " lead-form-compact" : ""}`} onSubmit={submit}>
      {(title || description) && <div className="lead-form-intro">{title && <h3>{title}</h3>}{description && <p>{description}</p>}</div>}
      <div className="form-fields-grid">
        <label>{t.name}<input name="name" autoComplete="name" required maxLength={100} /></label>
        <label>{t.phone}<input name="phone" autoComplete="tel" type="tel" required minLength={7} maxLength={24} /></label>
        <label>{t.email}<input name="email" autoComplete="email" type="email" maxLength={160} /></label>
        <label>{t.contact}<select name="preferredContact" defaultValue="phone"><option value="phone">{t.phoneContact}</option><option value="whatsapp">{t.whatsapp}</option><option value="email">{t.emailContact}</option></select></label>
        <label className="form-field-wide">{t.service}<select name="service" defaultValue=""><option value="">{t.placeholderService}</option>{t.services.map((service) => <option key={service} value={service}>{service}</option>)}</select></label>
        {type === "site_visit" && <>
          <label>{t.date}<input type="date" name="preferredDate" min={new Date().toISOString().slice(0, 10)} /></label>
          <label>{t.time}<select name="preferredTime" defaultValue=""><option value="">—</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
          <label className="form-field-wide">{t.address}<input name="address" maxLength={250} /></label>
        </>}
        {type === "callback" && <label className="form-field-wide">{t.time}<select name="preferredTime" defaultValue=""><option value="">—</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>}
        <label className="form-field-wide">{t.message}<textarea name="message" rows={compact ? 3 : 4} required minLength={3} maxLength={3000} /></label>
      </div>
      {/* Honeypot field: keep it hidden from normal users. */}
      <div className="hp-field" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button className="button button-dark lead-submit" type="submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="spin" /> : state?.ok ? <CheckCircle2 size={16} /> : <Send size={16} />}{busy ? t.sending : t.submit}</button>
      {state && <p role="status" className={`form-status ${state.ok ? "success" : "error"}`}>{state.message}</p>}
    </form>
  );
}
