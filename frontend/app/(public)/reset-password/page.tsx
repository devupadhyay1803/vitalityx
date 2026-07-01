"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
 const router = useRouter();
 const [password, setPassword] = useState("");
 const [confirm, setConfirm] = useState("");
 const [busy, setBusy] = useState(false);
 const [done, setDone] = useState(false);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (password.length < 8) return toast.error("Password must be at least 8 characters.");
 if (password !== confirm) return toast.error("Passwords don't match.");
 setBusy(true);
 const supabase = createClient();
 const { error } = await supabase.auth.updateUser({ password });
 setBusy(false);
 if (error) { toast.error(error.message); return; }
 setDone(true);
 toast.success("Password updated");
 setTimeout(async () => {
 await supabase.auth.signOut();
 router.push("/login");
 }, 2000);
 }

 return (
 <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md flex-col justify-center px-6 py-12">
 <h1 className="font-display text-4xl font-medium tracking-tight">Set new password</h1>
 {done ? (
 <div data-testid="reset-password-success" className="mt-8 vx-card p-6 text-sm">
 ✓ Password updated. Redirecting to login…
 </div>
 ) : (
 <form data-testid="reset-password-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
 <input
 data-testid="reset-password-input" type="password" required minLength={8}
 value={password} onChange={(e) => setPassword(e.target.value)}
 placeholder="New password (min 8 chars)" className="vx-input"
 />
 <input
 data-testid="reset-password-confirm" type="password" required minLength={8}
 value={confirm} onChange={(e) => setConfirm(e.target.value)}
 placeholder="Confirm password" className="vx-input"
 />
 <button data-testid="reset-password-submit" disabled={busy} className="btn btn-primary w-full">
 {busy ? "Updating…" : "Update password"}
 </button>
 </form>
 )}
 </div>
 );
}
