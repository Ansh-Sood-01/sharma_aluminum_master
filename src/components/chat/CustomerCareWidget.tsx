"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X, PhoneCall, Minus, LoaderCircle } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";

const chatCopy = {
  en: { label: "Customer care", hello: "Hello! I can help you explore services, find contact details, or understand how to request a quote.", placeholder: "Ask about your project…", send: "Send message", human: "Request a callback", close: "Close customer care", error: "Sorry, I could not answer right now. You can request a callback below." },
  hi: { label: "ग्राहक सहायता", hello: "नमस्ते! मैं सेवाओं, संपर्क जानकारी और कोटेशन अनुरोध के बारे में मदद कर सकता हूँ।", placeholder: "अपने काम के बारे में पूछें…", send: "संदेश भेजें", human: "कॉलबैक माँगें", close: "सहायता बंद करें", error: "अभी जवाब नहीं दे पाया। नीचे कॉलबैक का अनुरोध भेजें।" },
  pa: { label: "ਗਾਹਕ ਸਹਾਇਤਾ", hello: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਸੇਵਾਵਾਂ, ਸੰਪਰਕ ਜਾਣਕਾਰੀ ਅਤੇ ਕੋਟੇਸ਼ਨ ਦੀ ਬੇਨਤੀ ਬਾਰੇ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।", placeholder: "ਆਪਣੇ ਕੰਮ ਬਾਰੇ ਪੁੱਛੋ…", send: "ਸੁਨੇਹਾ ਭੇਜੋ", human: "ਕਾਲਬੈਕ ਮੰਗੋ", close: "ਸਹਾਇਤਾ ਬੰਦ ਕਰੋ", error: "ਮੈਂ ਹੁਣੇ ਜਵਾਬ ਨਹੀਂ ਦੇ ਸਕਿਆ। ਹੇਠਾਂ ਕਾਲਬੈਕ ਦੀ ਬੇਨਤੀ ਭੇਜੋ।" },
} as const;

type ChatMessage = { role: "user" | "assistant"; content: string; needsHuman?: boolean };

export default function CustomerCareWidget({ locale = "en" }: { locale?: "en" | "hi" | "pa" }) {
  const t = chatCopy[locale];
  const [open, setOpen] = useState(false);
  const [callback, setCallback] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: t.hello }]);
  const [sessionKey] = useState(() => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `sam-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const endRef = useRef<HTMLDivElement>(null);
  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, callback]);

  async function sendMessage(event?: React.FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    const userText = input.trim();
    const next = [...messages, { role: "user" as const, content: userText }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionKey, locale, messages: next.filter((m) => m.role === "user" || m.role === "assistant").slice(-10) }) });
      const result = await response.json() as { answer?: string; needsHuman?: boolean };
      if (!response.ok || !result.answer) throw new Error("No response");
      setMessages((current) => [...current, { role: "assistant", content: result.answer!, needsHuman: result.needsHuman }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: t.error, needsHuman: true }]);
    } finally { setLoading(false); }
  }

  return (
    <div className="customer-care-widget">
      {open && <section className="chat-panel" aria-label={t.label}>
        <header className="chat-header"><span className="chat-bot-mark"><Bot size={18} /></span><span><strong>{t.label}</strong><small>Sharma Aluminium Master</small></span><button type="button" onClick={() => setOpen(false)} aria-label={t.close}><Minus size={19} /></button><button type="button" onClick={() => { setOpen(false); setCallback(false); }} aria-label="Close chat"><X size={19} /></button></header>
        {!callback ? <>
          <div className="chat-messages" aria-live="polite">{messages.map((message, index) => <div key={`${index}-${message.role}`} className={`chat-bubble chat-${message.role}`}><p>{message.content}</p>{message.needsHuman && <button type="button" className="chat-escalate" onClick={() => setCallback(true)}><PhoneCall size={14} /> {t.human}</button>}</div>)}{loading && <div className="chat-bubble chat-assistant"><LoaderCircle className="spin" size={17} /></div>}<div ref={endRef} /></div>
          <form className="chat-composer" onSubmit={sendMessage}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.placeholder} maxLength={2500} aria-label={t.placeholder} /><button type="submit" disabled={!canSend} aria-label={t.send}><Send size={17} /></button></form>
          <div className="chat-footnote">AI suggestions can be incomplete. The team confirms measurements and quotations.</div>
        </> : <div className="chat-callback"><button className="chat-back" type="button" onClick={() => setCallback(false)}>← Back to chat</button><LeadForm locale={locale} type="callback" compact title={t.human} description="Share your contact details and the team can follow up." /></div>}
      </section>}
      <button className={`chat-launcher${open ? " is-open" : ""}`} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? t.close : t.label}>{open ? <X size={21} /> : <><MessageCircle size={21} /><span>{t.label}</span></>}</button>
    </div>
  );
}
