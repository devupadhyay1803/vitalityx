"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Show contextual feedback if redirected here from auth callback or idle timeout
  useState(() => {
    const error = params.get("error");
    const idle = params.get("idle");
    if (error === "auth_callback_failed") {
      toast.error("Your sign-in link has expired or is invalid. Please try again.");
    }
    if (idle === "1") {
      toast.info("You were signed out due to inactivity.");
    }
  });

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
