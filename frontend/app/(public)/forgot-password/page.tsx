"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
 const [email, setEmail] = useState("");
 const [busy, setBusy] = useState(false);
 const [sent, setSent] = useState(false);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setBusy(true);
 const supabase = createClient();
 const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
 const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
 setBusy(false);
 if (error) {
 toast.error(error.message);
 return;
 }
 setSent(true);
 }

 return (
 <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md flex-col justify-center px-6 py-12">
 <h1 className="font-display text-4xl font-medium tracking-tight">Reset password</h1>
 <p className="mt-2 text-muted-foreground">We&apos;ll send a reset link to your email.</p>
 {sent ? (
 <div data-testid="forgot-password-success" className="mt-8 vx-card p-6">
 <p className="text-sm">Check your inbox at <strong>{email}</strong> for a reset link. It expires in 1 hour.</p>
 <Link href="/login" className="mt-4 inline-block text-sm underline">Back to login</Link>
 </div>
 ) : (
 <form data-testid="forgot-password-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
 <input
 data-testid="forgot-password-email"
 type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
 placeholder="you@email.com" className="vx-input" autoComplete="email"
 />
 <button data-testid="forgot-password-submit" type="submit" disabled={busy} className="btn btn-primary w-full">
 {busy ? "Sending…" : "Send reset link"}
 </button>
 <Link href="/login" className="block text-center text-sm text-muted-foreground underline">Back to login</Link>
 </form>
 )}
 </div>
 );
}
