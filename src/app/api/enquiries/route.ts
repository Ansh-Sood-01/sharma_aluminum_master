import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { business } from "@/config/business";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const schema = z.object({
  type: z.enum(["quote", "project", "general", "callback", "site_visit"]).default("quote"),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(24).regex(/^[+()\d\s.-]+$/, "Enter a valid phone number."),
  email: z.union([z.string().trim().email().max(160), z.literal("")]).optional(),
  service: z.string().trim().max(100).optional(),
  message: z.string().trim().min(3).max(3000),
  preferredContact: z.enum(["phone", "whatsapp", "email"]).default("phone"),
  locale: z.enum(["en", "hi", "pa"]).default("en"),
  projectSlug: z.string().trim().max(160).optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().trim().max(60).optional(),
  address: z.string().trim().max(250).optional(),
  area: z.string().trim().max(120).optional(),
  website: z.string().optional(),
});

async function sendNotification(subject: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || business.email;
  if (!apiKey || !from) return { sent: false, reason: "email_not_configured" as const };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text: body }), cache: "no-store",
  });
  return response.ok ? { sent: true as const } : { sent: false as const, reason: "email_provider_error" as const };
}

export async function POST(request: Request) {
  const throttle = checkRateLimit(request, "enquiries", 6, 10 * 60 * 1000);
  if (!throttle.allowed) {
    return NextResponse.json({ success: false, message: "Too many requests. Please wait a little before trying again." }, { status: 429, headers: { "Retry-After": String(throttle.retryAfterSeconds) } });
  }
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ success: false, message: "Please check the required fields and try again." }, { status: 400 });
  const input = parsed.data;
  // Bots that fill the hidden field receive a neutral acknowledgement; nothing is stored.
  if (input.website) return NextResponse.json({ success: true, message: "Your request has been received." });

  const supabase = createSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ success: false, message: "The enquiry system is not connected yet. Please contact us by phone or WhatsApp." }, { status: 503 });

  const { data: enquiry, error } = await supabase.from("enquiries").insert({
    type: input.type, name: input.name, phone: input.phone, email: input.email || null,
    service: input.service || null, message: input.message, preferred_contact: input.preferredContact,
    locale: input.locale, project_slug: input.projectSlug || null, source: "website", status: "new",
  }).select("id").single();
  if (error || !enquiry) {
    console.error("Could not save enquiry", error?.message);
    return NextResponse.json({ success: false, message: "We could not save your request. Please call or WhatsApp the team instead." }, { status: 500 });
  }

  if (input.type === "site_visit") {
    const { error: visitError } = await supabase.from("site_visit_requests").insert({ enquiry_id: enquiry.id, preferred_date: input.preferredDate || null, preferred_time: input.preferredTime || null, address: input.address || "To be confirmed", area: input.area || null, requirement: input.message, status: "new" });
    if (visitError) console.error("Could not save site visit details", visitError.message);
  }
  if (input.type === "callback") {
    const { error: callbackError } = await supabase.from("callback_requests").insert({ enquiry_id: enquiry.id, preferred_time: input.preferredTime || null, status: "new" });
    if (callbackError) console.error("Could not save callback details", callbackError.message);
  }

  const subject = `Website ${input.type.replaceAll("_", " ")} request — ${input.name}`;
  const body = [
    `Type: ${input.type}`, `Name: ${input.name}`, `Phone: ${input.phone}`, `Email: ${input.email || "Not provided"}`,
    `Service: ${input.service || "Not selected"}`, `Preferred contact: ${input.preferredContact}`, `Project: ${input.projectSlug || "N/A"}`,
    `Preferred date/time: ${input.preferredDate || "N/A"} / ${input.preferredTime || "N/A"}`, `Address: ${input.address || "N/A"}`, "", input.message, "", `Enquiry ID: ${enquiry.id}`,
  ].join("\n");
  const email = await sendNotification(subject, body);
  return NextResponse.json({ success: true, message: "Your request has been received. The team will review it and contact you.", notificationSent: email.sent });
}
