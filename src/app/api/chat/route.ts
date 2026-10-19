import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { business } from "@/config/business";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const messageSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2500) });
const schema = z.object({
  sessionKey: z.string().min(8).max(100),
  locale: z.enum(["en", "hi", "pa"]).default("en"),
  messages: z.array(messageSchema).min(1).max(12),
  escalate: z.boolean().optional().default(false),
});

const safeFallback = (text: string, locale: string) => {
  const q = text.toLowerCase();
  const isHindi = locale === "hi";
  const isPunjabi = locale === "pa";
  if (/phone|call|contact|whatsapp|number|फोन|संपर्क|ਨੰਬਰ|ਸੰਪਰਕ/.test(q)) return { answer: `${business.contacts.map((c) => `${c.name}: ${c.displayPhone}`).join(" · ")}\nEmail: ${business.email}`, needsHuman: false };
  if (/address|location|map|where|पता|कहाँ|लोकेशन|ਪਤਾ|ਕਿੱਥੇ/.test(q)) return { answer: `${business.address}\n${process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLACE_URL || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${business.address}`)}`}`, needsHuman: false };
  if (/window|door|kitchen|cupboard|almirah|glass|partition|rack|gate|grill|किचन|खिड़की|दरवाज़|कपबर्ड|ਅਲਮਾਰੀ|ਖਿੜਕੀ|ਦਰਵਾਜ਼/.test(q)) return { answer: isHindi ? "हम एल्युमिनियम किचन, कपबोर्ड, दरवाज़े, खिड़कियाँ, ग्लास पार्टिशन और कस्टम फैब्रिकेशन के बारे में चर्चा कर सकते हैं। सही अनुमान के लिए माप, सामग्री और साइट की जानकारी चाहिए।" : isPunjabi ? "ਅਸੀਂ ਐਲੂਮੀਨੀਅਮ ਕਿਚਨ, ਕਬੱਡ, ਦਰਵਾਜ਼ੇ, ਖਿੜਕੀਆਂ, ਕੱਚ ਦੀਆਂ ਪਾਰਟੀਸ਼ਨਾਂ ਅਤੇ ਕਸਟਮ ਫੈਬ੍ਰਿਕੇਸ਼ਨ ਬਾਰੇ ਗੱਲ ਕਰ ਸਕਦੇ ਹਾਂ। ਸਹੀ ਅੰਦਾਜ਼ੇ ਲਈ ਮਾਪ, ਸਮੱਗਰੀ ਅਤੇ ਸਾਈਟ ਦੀ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ।" : "We can discuss aluminium kitchens, cupboards, doors, windows, glass partitions and custom fabrication. A useful estimate depends on measurements, materials and site requirements.", needsHuman: false };
  if (/price|cost|estimate|quotation|quote|rate|कीमत|दाम|कोटेशन|ਕੀਮਤ|ਰੇਟ/.test(q)) return { answer: isHindi ? "काम की कीमत आकार, सामग्री, हार्डवेयर और साइट की ज़रूरतों पर निर्भर करती है। मैं यहाँ कीमत का अनुमान नहीं लगाऊँगा। टीम से कोटेशन लेने के लिए अनुरोध भेजें।" : isPunjabi ? "ਕੀਮਤ ਆਕਾਰ, ਸਮੱਗਰੀ, ਹਾਰਡਵੇਅਰ ਅਤੇ ਸਾਈਟ ਦੀਆਂ ਲੋੜਾਂ 'ਤੇ ਨਿਰਭਰ ਕਰਦੀ ਹੈ। ਮੈਂ ਇੱਥੇ ਕੀਮਤ ਦਾ ਅੰਦਾਜ਼ਾ ਨਹੀਂ ਲਗਾਵਾਂਗਾ। ਕੋਟੇਸ਼ਨ ਲਈ ਟੀਮ ਨੂੰ ਬੇਨਤੀ ਭੇਜੋ।" : "Pricing depends on dimensions, material, hardware and site requirements. I won't guess a price here. Send a quote request and the team can review the details with you.", needsHuman: false };
  if (/time|hours|open|timing|समय|खुला|ਸਮਾਂ/.test(q)) return { answer: isHindi ? "माफ़ कीजिए, हमारे सत्यापित कामकाजी समय अभी वेबसाइट पर उपलब्ध नहीं हैं। कृपया टीम को कॉल करें।" : isPunjabi ? "ਮਾਫ਼ ਕਰਨਾ, ਸਾਡੇ ਪੁਸ਼ਟੀ ਕੀਤੇ ਕੰਮਕਾਜੀ ਸਮੇਂ ਹਾਲੇ ਵੈੱਬਸਾਈਟ 'ਤੇ ਉਪਲਬਧ ਨਹੀਂ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਟੀਮ ਨੂੰ ਕਾਲ ਕਰੋ।" : "Sorry, verified opening hours have not been configured on the website yet. Please call the team to confirm.", needsHuman: false };
  return { answer: isHindi ? "मैं इस सवाल का भरोसेमंद जवाब अभी नहीं दे सकता और अंदाज़ा नहीं लगाना चाहता। कृपया नीचे दिए गए विकल्प से टीम से संपर्क करने का अनुरोध भेजें।" : isPunjabi ? "ਮੈਂ ਇਸ ਸਵਾਲ ਦਾ ਭਰੋਸੇਯੋਗ ਜਵਾਬ ਹਾਲੇ ਨਹੀਂ ਦੇ ਸਕਦਾ ਅਤੇ ਅੰਦਾਜ਼ਾ ਨਹੀਂ ਲਗਾਉਣਾ ਚਾਹੁੰਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਕਲਪ ਰਾਹੀਂ ਟੀਮ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਦੀ ਬੇਨਤੀ ਭੇਜੋ।" : "I don't have a reliable answer to that yet, and I don't want to guess. Please request a callback below so the team can help you directly.", needsHuman: true };
};

async function askModel(messages: Array<{ role: "user" | "assistant"; content: string }>, locale: string) {
  const key = process.env.AI_API_KEY;
  const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL;
  if (!key || !model) return null;
  const system = `You are Sharma Aluminium Master's customer-care assistant for a local aluminium fabrication and installation business in Jalandhar, Punjab, India. Business details: ${business.address}; email ${business.email}; contacts ${business.contacts.map((c) => `${c.name} ${c.displayPhone}`).join(", ")}. Services include aluminium kitchens, cupboards and almirahs, doors, windows and frames, panels, office/commercial interiors, racks/storage, gates/grills, glass work, and premium glass + aluminium + profile-lighting work. Answer in the user's language (locale=${locale}; locales are English, Hindi, Punjabi). Keep answers concise and helpful. Never invent prices, opening hours, warranties, certifications, customer reviews, delivery times or years of experience. Ask for dimensions, materials and location when relevant. For exact quotations, site measurements, unusual technical claims or uncertain questions, say a team member should confirm them. Do not claim a request has been saved unless the system explicitly confirms it.`;
  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, cache: "no-store",
      body: JSON.stringify({ model, temperature: 0.2, max_tokens: 450, messages: [{ role: "system", content: system }, ...messages] }),
    });
    if (!response.ok) return null;
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const answer = data.choices?.[0]?.message?.content?.trim();
    return answer ? { answer, needsHuman: /team member|contact the team|cannot confirm|not sure|don't know/i.test(answer) } : null;
  } catch { return null; }
}

export async function POST(request: Request) {
  const throttle = checkRateLimit(request, "customer-care", 15, 60 * 1000);
  if (!throttle.allowed) {
    return NextResponse.json({ error: "You are sending messages too quickly. Please wait a moment." }, { status: 429, headers: { "Retry-After": String(throttle.retryAfterSeconds) } });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please send a valid message." }, { status: 400 });
  const input = parsed.data;
  const lastUserMessage = [...input.messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const fallback = safeFallback(lastUserMessage, input.locale);
  const modelResult = input.escalate ? null : await askModel(input.messages, input.locale);
  const response = input.escalate ? { answer: input.locale === "hi" ? "ज़रूर। कृपया नीचे अपना नाम और फ़ोन नंबर दें, ताकि टीम आपसे संपर्क कर सके।" : input.locale === "pa" ? "ਜ਼ਰੂਰ। ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਆਪਣਾ ਨਾਮ ਅਤੇ ਫ਼ੋਨ ਨੰਬਰ ਦਿਓ ਤਾਂ ਜੋ ਟੀਮ ਸੰਪਰਕ ਕਰ ਸਕੇ।" : "Certainly. Please add your name and phone number in the callback form so the team can contact you.", needsHuman: true } : modelResult || fallback;

  const supabase = createSupabaseServiceClient();
  if (supabase) {
    try {
      const { data: existing } = await supabase.from("ai_conversations").select("id").eq("session_key", input.sessionKey).maybeSingle();
      let conversationId = existing?.id;
      if (!conversationId) {
        const { data: created } = await supabase.from("ai_conversations").insert({ session_key: input.sessionKey, locale: input.locale, status: response.needsHuman ? "escalated" : "open" }).select("id").single();
        conversationId = created?.id;
      }
      if (conversationId) {
        await supabase.from("ai_messages").insert([
          { conversation_id: conversationId, role: "user", content: lastUserMessage },
          { conversation_id: conversationId, role: "assistant", content: response.answer, needs_human: response.needsHuman },
        ]);
        if (response.needsHuman) await supabase.from("ai_conversations").update({ status: "escalated" }).eq("id", conversationId);
      }
    } catch (error) { console.error("AI conversation history could not be saved", error); }
  }
  return NextResponse.json({ answer: response.answer, needsHuman: response.needsHuman, providerConfigured: Boolean(process.env.AI_API_KEY && process.env.AI_MODEL) });
}
