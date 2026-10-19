import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/admin";
export async function GET() {
  const admin = await getAdminUser();
  return admin ? NextResponse.json({ authorized: true }) : NextResponse.json({ authorized: false }, { status: 403 });
}
