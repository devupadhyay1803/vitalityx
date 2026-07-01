"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/cart/cart-provider";
import { getInitials } from "@/lib/utils";
import { ShoppingBag, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type SessionState = {
 user: { id: string; email: string } | null;
 profile: { full_name: string | null; role: string } | null;
 loading: boolean;
};

export function PublicNavbar() {
 const router = useRouter();
 const { count } = useCart();
 const [state, setState] = useState<SessionState>({ user: null, profile: null, loading: true });
 const [menuOpen, setMenuOpen] = useState(false);
 const menuRef = useRef<HTMLDivElement | null>(null);

 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 useEffect(() => {
 const supabase = createClient();
 let mounted = true;

 async function loadSession() {
 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session?.user) {
 if (mounted) setState({ user: null, profile: null, loading: false });
 return;
 }
 const { data: profile } = await supabase
 .from("profiles")
 .select("full_name, role")
 .eq("id", session.user.id)
 .single();
 if (mounted)
 setState({
 user: { id: session.user.id, email: session.user.email || "" },
 profile: profile || { full_name: null, role: "Member" },
 loading: false,
 });
 } catch (e) {
 console.warn("[navbar] session load failed", e);
 if (mounted) setState({ user: null, profile: null, loading: false });
 }
 }
 loadSession();

 const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
 loadSession();
 });

 return () => {
 mounted = false;
 subscription.unsubscribe();
 };
 }, []);

 useEffect(() => {
 function onClick(e: MouseEvent) {
 if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
 }
 document.addEventListener("mousedown", onClick);
 return () => document.removeEventListener("mousedown", onClick);
 }, []);

 async function handleSignOut() {
 const supabase = createClient();
 await supabase.auth.signOut();
 setMenuOpen(false);
 setMobileMenuOpen(false);
 router.push("/");
 router.refresh();
 }

 const dashHref =
 state.profile?.role === "Member" ? "/member/dashboard" : "/staff/dashboard";

 return (
 <>
 <header
 data-testid="public-navbar"
 className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md"
 >
 <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
 <Link href="/" data-testid="navbar-logo" className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight">
 <span className="inline-block h-7 w-7 rounded-full bg-[var(--vx-jade)]" />
 <span className="hidden sm:inline">VitalityX</span>
 </Link>

 <nav className="hidden gap-8 md:flex">
 <Link href="/programs" className="text-sm text-muted-foreground hover:text-foreground">Programs</Link>
 <Link href="/genetics" className="text-sm text-muted-foreground hover:text-foreground">Genetics</Link>
 <Link href="/labs" className="text-sm text-muted-foreground hover:text-foreground">Labs</Link>
 <Link href="/supplements" className="text-sm text-muted-foreground hover:text-foreground">Store</Link>
 <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
 </nav>

 <div className="flex items-center gap-3">
 <Link href="/cart" data-testid="navbar-cart-link" className="relative rounded-full p-2 hover:bg-muted">
 <ShoppingBag size={18} />
 {count > 0 && (
 <span data-testid="cart-count-badge" className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--vx-jade)] px-1 text-[10px] font-semibold text-[var(--vx-ink)]">
 {count}
 </span>
 )}
 </Link>

 {state.loading ? (
 <div className="h-9 w-20 animate-pulse rounded-full bg-muted" />
 ) : state.user ? (
 <div ref={menuRef} className="relative hidden md:block">
 <button
 data-testid="navbar-avatar-btn"
 onClick={() => setMenuOpen((o) => !o)}
 className="flex items-center gap-2 rounded-full vx-card px-2 py-1.5 transition hover:bg-muted"
 >
 <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--vx-ink)] text-xs font-semibold text-white">
 {getInitials(state.profile?.full_name || state.user.email)}
 </span>
 <ChevronDown size={14} className="text-muted-foreground" />
 </button>
 {menuOpen && (
 <div data-testid="navbar-avatar-menu" className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
 <div className="border-b border-border px-3 pb-2 pt-1">
 <div className="truncate text-sm font-medium">{state.profile?.full_name || "Member"}</div>
 <div className="truncate text-xs text-muted-foreground">{state.user.email}</div>
 </div>
 <Link
 href={dashHref}
 data-testid="navbar-go-dashboard"
 onClick={() => setMenuOpen(false)}
 className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
 >
 <LayoutDashboard size={14} /> Go to Dashboard
 </Link>
 <button
 data-testid="navbar-sign-out"
 onClick={handleSignOut}
 className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
 >
 <LogOut size={14} /> Sign Out
 </button>
 </div>
 )}
 </div>
 ) : (
 <>
 <Link href="/login" data-testid="navbar-sign-in" className="btn btn-ghost whitespace-nowrap text-sm sm:px-5 hidden md:inline-flex">
 Sign In
 </Link>
 <Link href="/signup" data-testid="navbar-get-started" className="btn btn-primary hidden whitespace-nowrap sm:inline-flex">
 Get Started
 </Link>
 </>
 )}

 <button 
 className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted" 
 onClick={() => setMobileMenuOpen(true)}
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
 </button>
 </div>
 </div>
 </header>

 {/* Mobile Fullscreen Menu */}
 {mobileMenuOpen && (
 <div className="md:hidden fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in zoom-in-95 duration-200">
 <div className="flex items-center justify-between border-b border-border px-6 py-4">
 <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight" onClick={() => setMobileMenuOpen(false)}>
 <span className="inline-block h-6 w-6 rounded-full bg-[var(--vx-jade)]" /> VitalityX
 </Link>
 <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
 <nav className="flex flex-col gap-6">
 <Link href="/programs" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium hover:text-[var(--vx-jade)] transition-colors">Programs</Link>
 <Link href="/genetics" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium hover:text-[var(--vx-jade)] transition-colors">Genetics</Link>
 <Link href="/labs" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium hover:text-[var(--vx-jade)] transition-colors">Labs</Link>
 <Link href="/supplements" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium hover:text-[var(--vx-jade)] transition-colors">Store</Link>
 <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium hover:text-[var(--vx-jade)] transition-colors">Contact</Link>
 </nav>

 <div className="mt-8 pt-8 border-t border-border flex flex-col gap-4">
 {state.user ? (
 <>
 <div className="flex items-center gap-3 mb-2">
 <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--vx-ink)] text-sm font-semibold text-white">
 {getInitials(state.profile?.full_name || state.user.email)}
 </span>
 <div>
 <div className="font-medium">{state.profile?.full_name || "Member"}</div>
 <div className="text-sm text-muted-foreground">{state.user.email}</div>
 </div>
 </div>
 <Link href={dashHref} onClick={() => setMobileMenuOpen(false)} className="btn btn-primary w-full justify-center">Go to Dashboard</Link>
 <button onClick={handleSignOut} className="btn btn-outline w-full justify-center text-destructive border-destructive/20 hover:bg-destructive/10">Sign Out</button>
 </>
 ) : (
 <>
 <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline w-full justify-center">Sign In</Link>
 <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary w-full justify-center">Get Started</Link>
 </>
 )}
 </div>
 </div>
 </div>
 )}
 </>
 );
}