"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      if (!response.ok) { await supabase.auth.signOut(); throw new Error("This account is not enabled as an administrator. Ask the project owner to add its user ID to admin_users."); }
      router.push("/admin/dashboard"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Sign-in failed."); }
    finally { setLoading(false); }
  }

  return <main className="admin-login-shell"><a className="brand" href="/en"><span className="brand-mark">S<span>.</span></span><span className="brand-name"><strong>SHARMA</strong><small>ALUMINIUM MASTER</small></span></a><div className="admin-login-card"><div className="admin-lock-mark"><LockKeyhole size={23} /></div><p className="eyebrow">PRIVATE WORKSPACE</p><h1>Administrator sign in</h1><p>Manage portfolio projects, categories and customer requests.</p>{!configured && <div className="admin-warning">Supabase is not configured yet. Copy <code>.env.example</code> to <code>.env.local</code>, add your Supabase URL and public key, restart the development server, and apply the SQL migration.</div>}<form onSubmit={signIn} className="admin-login-form"><label>Email address<span><Mail size={16} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></span></label><label>Password<span><KeyRound size={16} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" minLength={6} required /></span></label><button className="button button-dark" disabled={loading || !configured}>{loading ? <LoaderCircle className="spin" size={17} /> : <ShieldCheck size={17} />}{loading ? "Signing in…" : "Sign in securely"}</button>{error && <p className="form-status error" role="alert">{error}</p>}</form><p className="admin-login-note">Signing in alone does not grant admin access. Your user must be added to the Supabase <code>admin_users</code> table.</p></div><a className="admin-back-home" href="/en">← Return to public website</a></main>;
}
