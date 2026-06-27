"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DemoSwitcher() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (!demoEnabled) return null;

  async function switchTo(role: "member" | "coach") {
    setBusy(role);
    const supabase = createClient();
    await supabase.auth.signOut();

    const email =
      role === "member"
        ? process.env.NEXT_PUBLIC_DEMO_MEMBER_EMAIL!
        : process.env.NEXT_PUBLIC_DEMO_COACH_EMAIL!;
    const password =
      role === "member"
        ? process.env.NEXT_PUBLIC_DEMO_MEMBER_PASSWORD!
        : process.env.NEXT_PUBLIC_DEMO_COACH_PASSWORD!;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(`Demo sign-in failed: ${error.message}`);
      setBusy(null);
      return;
    }
    const dest = role === "member" ? "/member/dashboard" : "/staff/dashboard";
    router.push(dest);
    router.refresh();
    setTimeout(() => setBusy(null), 1500);
  }

  return (
    <div
      data-testid="demo-switcher"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[var(--vx-ink)] p-1.5 text-white shadow-2xl"
    >
      <span className="px-2 text-[10px] font-medium uppercase tracking-widest text-white/50">Demo</span>
      <button
        data-testid="demo-switch-member"
        onClick={() => switchTo("member")}
        disabled={busy !== null}
        className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/20 disabled:opacity-50"
      >
        {busy === "member" ? "Loading…" : "Member View"}
      </button>
      <button
        data-testid="demo-switch-coach"
        onClick={() => switchTo("coach")}
        disabled={busy !== null}
        className="rounded-full bg-[var(--vx-jade)] px-3 py-1.5 text-xs font-medium text-[var(--vx-ink)] transition hover:brightness-110 disabled:opacity-50"
      >
        {busy === "coach" ? "Loading…" : "Coach View"}
      </button>
    </div>
  );
}
