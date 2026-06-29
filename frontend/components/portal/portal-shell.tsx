"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import {
  Home, LineChart, ListChecks, CalendarDays, Package, MessageSquare,
  Activity, Settings, LogOut, Users, FileText,
} from "lucide-react";

type Nav = { href: string; label: string; icon: React.ComponentType<{ size?: number }>; testId: string };

const MEMBER_NAV: Nav[] = [
  { href: "/member/dashboard",   label: "Dashboard",   icon: Home,         testId: "sidebar-dashboard" },
  { href: "/member/data",        label: "My Data",     icon: LineChart,    testId: "sidebar-data" },
  { href: "/member/protocol",    label: "Protocol",    icon: ListChecks,   testId: "sidebar-protocol" },
  { href: "/member/sessions",    label: "Sessions",    icon: CalendarDays, testId: "sidebar-sessions" },
  { href: "/member/supplements", label: "Supplements", icon: Package,      testId: "sidebar-supplements" },
  { href: "/member/messages",    label: "Messages",    icon: MessageSquare,testId: "sidebar-messages" },
  { href: "/member/check-in",    label: "Check-in",    icon: Activity,     testId: "sidebar-checkin" },
  { href: "/member/billing",     label: "Billing",     icon: FileText,     testId: "sidebar-billing" },
  { href: "/member/settings",    label: "Settings",    icon: Settings,     testId: "sidebar-settings" },
];

const STAFF_NAV: Nav[] = [
  { href: "/staff/dashboard",  label: "Overview", icon: Home,         testId: "sidebar-staff-dashboard" },
  { href: "/staff/clients",    label: "Clients",  icon: Users,        testId: "sidebar-staff-clients" },
  { href: "/staff/sessions",   label: "Sessions", icon: CalendarDays, testId: "sidebar-staff-sessions" },
  { href: "/staff/messages",   label: "Messages", icon: MessageSquare,testId: "sidebar-staff-messages" },
  { href: "/staff/settings",   label: "Settings", icon: Settings,     testId: "sidebar-staff-settings" },
];

export function PortalShell({ variant, user, profile, children }: {
  variant: "member" | "staff";
  user: { id: string; email: string };
  profile: { full_name: string | null; role: string };
  children: React.ReactNode;
}) {
  const router = useRouter();
  const path = usePathname();
  const nav = variant === "member" ? MEMBER_NAV : STAFF_NAV;
  const idle = useIdleTimeout(variant === "staff" ? 30 * 60 * 1000 : 60 * 60 * 1000);
  void idle; // mounted via hook

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[var(--vx-cream)]/40">
      <aside data-testid="portal-sidebar" className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <Link href="/" className="flex items-center gap-2 px-6 py-5 font-display text-xl font-semibold">
          <span className="inline-block h-5 w-5 rounded-full bg-[var(--vx-jade)]" /> VitalityX
        </Link>
        <nav className="flex-1 px-3">
          {nav.map((item) => {
            const active = path === item.href || path.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-[var(--vx-ink)] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3 pb-28 md:pb-28">
          <div className="flex items-center gap-2 rounded-lg p-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--vx-ink)] text-xs font-semibold text-white">
              {getInitials(profile.full_name || user.email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile.full_name || "Member"}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.role}</p>
            </div>
          </div>
          <button onClick={handleSignOut} data-testid="sidebar-signout" className="mt-1 ml-10 flex w-[calc(100%-2.5rem)] items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav data-testid="portal-mobile-nav" className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card md:hidden">
        {nav.slice(0, 5).map((item) => {
          const active = path === item.href || path.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] ${active ? "text-[var(--vx-ink)]" : "text-muted-foreground"}`}>
              <Icon size={18} /> {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 pb-24 md:pb-0">{children}</main>
    </div>
  );
}

function useIdleTimeout(ms: number) {
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  useEffect(() => {
    const reset = () => {
      if (ref.current) clearTimeout(ref.current);
      ref.current = setTimeout(async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login?idle=1");
      }, ms);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (ref.current) clearTimeout(ref.current);
    };
  }, [ms, router]);
}

export const _legalNav = { FileText }; // silence unused import
