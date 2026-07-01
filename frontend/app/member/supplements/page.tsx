"use client";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";

const supabase = createClient();

export default function SupplementsPage() {
 const { data, error, isLoading, mutate } = useSWR("supplements", async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return null;
 const { data: subs, error } = await supabase.from("supplement_subscriptions").select("*").eq("member_id", user.id).order("created_at", { ascending: false });
 if (error) throw error;
 return { userId: user.id, subs: subs || [] };
 });

 async function setStatus(id: string, stripe_id: string, status: "paused" | "cancelled") {
 const res = await fetch("/api/stripe/subscription", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ subscription_id: id, stripe_subscription_id: stripe_id, status }),
 });
 if (!res.ok) {
 const j = await res.json().catch(() => ({}));
 return toast.error(j.error || "Action failed");
 }
 toast.success(`Subscription ${status}`);
 mutate();
 }

 if (isLoading) return (
 <div className="mx-auto max-w-3xl px-6 py-10">
 <div className="h-10 w-48 bg-muted rounded animate-pulse mb-2"></div>
 <div className="h-4 w-64 bg-muted rounded animate-pulse mb-8"></div>
 <div className="space-y-4">
 <div className="h-20 bg-muted/50 rounded-xl animate-pulse"></div>
 <div className="h-20 bg-muted/50 rounded-xl animate-pulse"></div>
 </div>
 </div>
 );

 if (error) return (
 <div className="mx-auto max-w-3xl px-6 py-10 text-center">
 <p className="text-destructive font-medium">Failed to load subscriptions.</p>
 <button onClick={() => mutate()} className="mt-4 btn btn-outline text-xs">Try again</button>
 </div>
 );

 if (!data) return null;

 return (
 <div className="mx-auto max-w-3xl px-6 py-10" data-testid="member-supplements-page">
 <h1 className="font-display text-4xl font-medium">Supplements</h1>
 <p className="mt-2 text-muted-foreground">Manage your active subscriptions.</p>

 {data.subs.length === 0 ? (
 <div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
 No active subscriptions. <Link href="/#supplements" className="underline">Browse the stack →</Link>
 </div>
 ) : (
 <ul className="mt-8 space-y-3">
 {data.subs.map((s: any) => (
 <li key={s.id} className="vx-card flex items-center justify-between p-6">
 <div>
 <p className="font-medium">{s.product_name}</p>
 <p className="text-xs text-muted-foreground">Status: <span className={`badge ${s.status==="active"?"badge-jade":s.status==="paused"?"badge-amber":"badge-coral"}`}>{s.status}</span></p>
 </div>
 <div className="flex gap-2">
 {s.status === "active" && <button data-testid={`pause-${s.id}`} onClick={() => setStatus(s.id, s.stripe_subscription_id, "paused")} className="btn btn-outline text-xs">Pause</button>}
 {s.status === "paused" && <button data-testid={`resume-${s.id}`} onClick={() => setStatus(s.id, s.stripe_subscription_id, "paused")} className="btn btn-outline text-xs">Resume</button>}
 {s.status !== "cancelled" && <button data-testid={`cancel-${s.id}`} onClick={() => setStatus(s.id, s.stripe_subscription_id, "cancelled")} className="btn btn-outline text-xs">Cancel</button>}
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 );
}
