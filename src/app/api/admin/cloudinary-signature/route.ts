import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdminUser } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ error: "Cloudinary is not configured. Add the Cloudinary cloud name, API key, and API secret to the server environment." }, { status: 503 });
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = (process.env.CLOUDINARY_FOLDER || "sharma-aluminium-master").replace(/[^a-zA-Z0-9/_-]/g, "");
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);
  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
