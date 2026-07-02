"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { getInitials } from "@/lib/utils";
import { logClientAudit } from "@/lib/audit-client";
import { useEffect, useState, useRef } from "react";
import { NotificationsPopover } from "@/components/portal/notifications-popover";
import {
 Home, LineChart, ListChecks, CalendarDays, Package, MessageSquare,
 Activity, Settings, LogOut, Users, FileText, Moon, Sun, ShieldAlert, Clock
} from "lucide-react";

type Nav = { href: string; label: string; icon: React.ComponentType<{ size?: number }>; testId: string };

const MEMBER_NAV: Nav[] = [
 { href: "/member/dashboard", label: "Dashboard", icon: Home, testId: "sidebar-dashboard" },
 { href: "/member/team", label: "Care Team", icon: Users, testId: "sidebar-team" },
 { href: "/member/data", label: "My Data", icon: LineChart, testId: "sidebar-data" },
 { href: "/member/protocol", label: "Protocol", icon: ListChecks, testId: "sidebar-protocol" },
 { href: "/member/sessions", label: "Sessions", icon: CalendarDays, testId: "sidebar-sessions" },
 { href: "/member/supplements", label: "Supplements", icon: Package, testId: "sidebar-supplements" },
 { href: "/member/messages", label: "Messages", icon: MessageSquare,testId: "sidebar-messages" },
 { href: "/member/check-in", label: "Check-in", icon: Activity, testId: "sidebar-checkin" },
 { href: "/member/labs", label: "Labs", icon: FileText, testId: "sidebar-labs" },
 { href: "/member/activity", label: "Activity", icon: Clock, testId: "sidebar-activity" },
 { href: "/member/billing", label: "Billing", icon: Package, testId: "sidebar-billing" },
 { href: "/member/settings", label: "Settings", icon: Settings, testId: "sidebar-settings" },
];

const STAFF_NAV: Nav[] = [
  { href: "/staff/dashboard", label: "Dashboard", icon: Home, testId: "sidebar-staff-dashboard" },
  { href: "/staff/clients", label: "Clients", icon: Users, testId: "sidebar-staff-clients" },
  { href: "/staff/care-team", label: "Care Team", icon: Users, testId: "sidebar-staff-care-team" },
  { href: "/staff/sessions", label: "Sessions", icon: CalendarDays, testId: "sidebar-staff-sessions" },
  { href: "/staff/messages", label: "Messages", icon: MessageSquare, testId: "sidebar-staff-messages" },
  { href: "/staff/users", label: "Users", icon: Users, testId: "sidebar-staff-users" },
  { href: "/staff/revenue", label: "Revenue", icon: LineChart, testId: "sidebar-staff-revenue" },
  { href: "/staff/audit", label: "Audit Logs", icon: ShieldAlert, testId: "sidebar-staff-audit" },
  { href: "/staff/health", label: "Platform Health", icon: Activity, testId: "sidebar-staff-health" },
  { href: "/staff/operations", label: "Operations", icon: LineChart, testId: "sidebar-staff-operations" },
  { href: "/staff/settings", label: "Settings", icon: Settings, testId: "sidebar-staff-settings" },
];

import { UserProvider } from "@/components/portal/user-provider";

export function PortalShell({ variant, user, profile, children }: {
 variant: "member" | "staff";
 user: { id: string; email: string };
 profile: { full_name: string | null; role: string };
 children: React.ReactNode;
}) {
 const router = useRouter();
 const path = usePathname();
 const { theme, setTheme } = useTheme();
 const nav = variant === "member" ? MEMBER_NAV : STAFF_NAV;
 const idle = useIdleTimeout(variant === "staff" ? 30 * 60 * 1000 : 60 * 60 * 1000);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 void idle; // mounted via hook

 async function handleSignOut() {
 await logClientAudit("Logout");
 const supabase = createClient();
 await supabase.auth.signOut();
 router.push("/login");
 router.refresh();
 }

 return (
 <UserProvider user={user} profile={profile}>
 <div className="flex min-h-screen bg-[var(--vx-cream)]/40">
 <aside data-testid="portal-sidebar" className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
 <Link href="/" className="flex items-center gap-2 px-6 py-5 font-display text-xl font-semibold">
 <span className="inline-block h-5 w-5 rounded-full bg-[var(--vx-jade)]" /> VitalityX
 </Link>
 <nav className="flex-1 px-3">
  {nav.filter(item => {
    const adminRoutes = ["/staff/users", "/staff/revenue", "/staff/audit", "/staff/health", "/staff/operations"];
    if (adminRoutes.includes(item.href)) {
      return profile.role === "Admin";
    }
    return true;
  }).map((item) => {
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
 <div className="mb-2">
 <NotificationsPopover variant={variant} />
 </div>
 <div className="flex items-center gap-2 rounded-lg p-2">
 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--vx-ink)] text-xs font-semibold text-white">
 {getInitials(profile.full_name || user.email)}
 </span>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-medium">{profile.full_name || "Member"}</p>
 <p className="truncate text-xs text-muted-foreground">{profile.role}</p>
 </div>
 </div>
 <div className="flex items-center justify-between px-3 mt-1">
 <button onClick={handleSignOut} data-testid="sidebar-signout" className="flex items-center gap-2 rounded-lg py-2 text-sm text-destructive hover:bg-destructive/10 px-2 transition">
 <LogOut size={14} /> Sign out
 </button>
 <button 
 onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
 className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
 aria-label="Toggle Theme"
 >
 <Moon size={16} className="hidden dark:block" />
 <Sun size={16} className="block dark:hidden" />
 </button>
 </div>
 </div>
 </aside>

 {/* Mobile Header */}
 <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
 <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
 <span className="inline-block h-5 w-5 rounded-full bg-[var(--vx-jade)]" /> VitalityX
 </Link>
 <div className="flex items-center gap-3">
 <NotificationsPopover variant={variant} />
 <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
 </button>
 </div>
 </div>

 {/* Mobile Fullscreen Menu */}
 {mobileMenuOpen && (
 <div className="md:hidden fixed inset-0 z-50 bg-card flex flex-col animate-in fade-in zoom-in-95 duration-200">
 <div className="flex items-center justify-between border-b border-border px-4 py-3">
 <div className="flex items-center gap-2 font-display text-lg font-semibold">
 <span className="inline-block h-5 w-5 rounded-full bg-[var(--vx-jade)]" /> Menu
 </div>
 <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
 <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-muted/50 border border-border">
 <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--vx-ink)] text-sm font-semibold text-white">
 {getInitials(profile.full_name || user.email)}
 </span>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-medium">{profile.full_name || "Member"}</p>
 <p className="truncate text-xs text-muted-foreground">{profile.role}</p>
 </div>
 </div>

 {nav.filter(item => {
    const adminRoutes = ["/staff/users", "/staff/revenue", "/staff/audit", "/staff/health", "/staff/operations"];
    if (adminRoutes.includes(item.href)) {
      return profile.role === "Admin";
    }
    return true;
  }).map((item) => {
 const active = path === item.href || path.startsWith(item.href + "/");
 const Icon = item.icon;
 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setMobileMenuOpen(false)}
 className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition ${
 active ? "bg-[var(--vx-ink)] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
 }`}
 >
 <Icon size={18} /> {item.label}
 </Link>
 );
 })}
 </div>

 <div className="border-t border-border p-4 flex items-center justify-between pb-safe">
 <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-destructive font-medium px-2 py-2">
 <LogOut size={16} /> Sign out
 </button>
 <button 
 onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
 className="p-2 rounded-lg text-muted-foreground bg-muted hover:text-foreground transition flex items-center gap-2 text-sm"
 >
 <Moon size={16} className="hidden dark:block" />
 <Sun size={16} className="block dark:hidden" />
 Theme
 </button>
 </div>
 </div>
 )}

 {/* Mobile bottom bar (optional now, but kept for quick access) */}
 <nav data-testid="portal-mobile-nav" className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card md:hidden pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
 {nav.slice(0, 5).map((item) => {
 const active = path === item.href || path.startsWith(item.href + "/");
 const Icon = item.icon;
 return (
 <Link key={item.href} href={item.href} className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${active ? "text-[var(--vx-ink)]" : "text-muted-foreground"}`}>
 <Icon size={20} className={active ? "scale-110 transition-transform" : ""} /> {item.label}
 </Link>
 );
 })}
 </nav>

 <main className="flex-1 pb-24 md:pb-0 overflow-x-hidden min-h-screen">{children}</main>
 </div>
 </UserProvider>
 );
}

function useIdleTimeout(ms: number) {
 const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
 const router = useRouter();
 useEffect(() => {
 let lastReset = Date.now();
 const reset = (force = false) => {
 if (!force && Date.now() - lastReset < 10000) return;
 lastReset = Date.now();
 if (ref.current) clearTimeout(ref.current);
 ref.current = setTimeout(async () => {
 await logClientAudit("Logout", { metadata: { reason: "idle_timeout" } });
 const supabase = createClient();
 await supabase.auth.signOut();
 router.push("/login?idle=1");
 }, ms);
 };
 const events = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;
 const handleEvent = () => reset(false);
 events.forEach((e) => window.addEventListener(e, handleEvent, { passive: true }));
 reset(true);
 return () => {
 events.forEach((e) => window.removeEventListener(e, handleEvent));
 if (ref.current) clearTimeout(ref.current);
 };
 }, [ms, router]);
}

export const _legalNav = { FileText }; // silence unused import
