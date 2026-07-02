"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { logClientAudit } from "@/lib/audit-client";

function LoginForm() {
 const router = useRouter();
 const params = useSearchParams();
 const redirectTo = params.get("redirectTo");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [busy, setBusy] = useState(false);

 useEffect(() => {
 // 1. Show contextual feedback
 const error = params.get("error");
 const idle = params.get("idle");
 if (error === "auth_callback_failed") {
 toast.error("Your sign-in link has expired or is invalid. Please try again.");
 }
 if (idle === "1") {
 toast.info("You were signed out due to inactivity.");
 }

 // 2. Redirect if already logged in
 const checkSession = async () => {
 const supabase = createClient();
 const { data: { session } } = await supabase.auth.getSession();
 if (session) {
 const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
 const dest = redirectTo || (profile?.role === "Member" ? "/member/dashboard" : "/staff/dashboard");
 router.push(dest);
 }
 };
 checkSession();
 }, [params, redirectTo, router]);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setBusy(true);
 const supabase = createClient();
 const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 if (error) {
 toast.error(error.message);
 setBusy(false);
 return;
 }
 const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
 const dest = redirectTo || (profile?.role === "Member" ? "/member/dashboard" : "/staff/dashboard");
 
 await logClientAudit("Login");

 router.push(dest);
 router.refresh();
 }

 return (
 <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-4">
 <div>
 <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
 <input
 data-testid="login-email"
 type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
 className="vx-input" autoComplete="email"
 />
 </div>
 <div>
 <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
 <input
 data-testid="login-password"
 type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
 className="vx-input" autoComplete="current-password"
 />
 </div>
 <div className="flex items-center justify-between text-sm">
 <Link href="/forgot-password" data-testid="login-forgot-password" className="text-muted-foreground hover:text-foreground">
 Forgot password?
 </Link>
 </div>
 <button data-testid="login-submit" type="submit" disabled={busy} className="btn btn-primary w-full">
 {busy ? "Signing in…" : "Sign In"}
 </button>
  <p className="pt-2 text-center text-sm text-muted-foreground">
    Don&apos;t have an account?{" "}
    <Link href="/signup" data-testid="login-signup-link" className="font-medium text-[var(--vx-ink)] underline underline-offset-2">
      Sign up →
    </Link>
  </p>

  {/* Demo credentials helper */}
  <div className="mt-8 border-t border-border/50 pt-6">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center">Demo Quick Login</p>
    <div className="grid grid-cols-3 gap-2">
      <button 
        type="button" 
        onClick={() => { setEmail("admin@vitalityx.com"); setPassword("password"); }}
        className="px-3 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-semibold rounded-xl border border-red-500/20 transition-all text-center cursor-pointer"
      >
        Admin
      </button>
      <button 
        type="button" 
        onClick={() => { setEmail("demo.staff@vitalityx.ai"); setPassword("Demo@12345"); }}
        className="px-3 py-2.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-semibold rounded-xl border border-blue-500/20 transition-all text-center cursor-pointer"
      >
        Coach
      </button>
      <button 
        type="button" 
        onClick={() => { setEmail("demo.member@vitalityx.ai"); setPassword("Demo@12345"); }}
        className="px-3 py-2.5 bg-[var(--vx-jade)]/10 text-[var(--vx-jade)] hover:bg-[var(--vx-jade)]/20 text-xs font-semibold rounded-xl border border-[var(--vx-jade)]/20 transition-all text-center cursor-pointer"
      >
        Member
      </button>
    </div>
  </div>
  </form>
 );
}

export default function LoginPage() {
 return (
 <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md flex-col justify-center px-6 py-12">
 <div className="mb-8">
 <h1 className="font-display text-4xl font-medium tracking-tight">Welcome back</h1>
 <p className="mt-2 text-muted-foreground">Sign in to your VitalityX portal.</p>
 </div>
 <Suspense fallback={<div>Loading…</div>}>
 <LoginForm />
 </Suspense>
 </div>
 );
}
