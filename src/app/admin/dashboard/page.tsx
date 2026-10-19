import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/admin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export default async function AdminDashboardPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin");
  return <AdminDashboard user={{ email: user.email, fullName: user.fullName }} />;
}
