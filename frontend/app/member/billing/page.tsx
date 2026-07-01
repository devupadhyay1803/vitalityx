"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Package, CreditCard, Receipt, ExternalLink, Calendar, Truck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

export default function BillingPage() {
 const [tab, setTab] = useState<"subscriptions" | "orders" | "invoices">("subscriptions");

 const { data: user, error: userError } = useSWR("user", async () => {
 const { data, error } = await supabase.auth.getUser();
 if (error) throw error;
 return data.user;
 });

 const { data: orders, error: ordersError, isLoading: ordersLoading, mutate: mutateOrders } = useSWR(user ? `orders-${user.id}` : null, async () => {
 const { data, error } = await supabase.from("orders").select("*").eq("member_id", user!.id).order("created_at", { ascending: false });
 if (error) throw error;
 return data || [];
 });

 const { data: subscriptions, error: subsError, isLoading: subsLoading, mutate: mutateSubs } = useSWR(user ? `subscriptions-${user.id}` : null, async () => {
 const { data, error } = await supabase.from("supplement_subscriptions").select("*").eq("member_id", user!.id).eq("status", "active");
 if (error) throw error;
 return data || [];
 });

 const handleManageSub = () => {
 toast.info("Customer portal opening...");
 // In a real app, this would redirect to the Stripe Customer Portal
 };

 return (
 <div className="mx-auto max-w-5xl px-6 py-10" data-testid="member-billing-page">
 <h1 className="font-display text-4xl font-medium">Billing & Orders</h1>
 
 <div className="mt-6 flex gap-4 border-b border-border pb-2 text-sm overflow-x-auto mb-8">
 <button 
 onClick={() => setTab("subscriptions")}
 className={`whitespace-nowrap px-1 pb-2 flex items-center gap-2 ${tab === "subscriptions" ? "font-medium text-[var(--vx-ink)] border-b-2 border-[var(--vx-ink)]" : "text-muted-foreground hover:text-foreground"}`}
 >
 <Calendar size={16} /> Subscriptions
 </button>
 <button 
 onClick={() => setTab("orders")}
 className={`whitespace-nowrap px-1 pb-2 flex items-center gap-2 ${tab === "orders" ? "font-medium text-[var(--vx-ink)] border-b-2 border-[var(--vx-ink)]" : "text-muted-foreground hover:text-foreground"}`}
 >
 <Package size={16} /> Orders & Tracking
 </button>
 <button 
 onClick={() => setTab("invoices")}
 className={`whitespace-nowrap px-1 pb-2 flex items-center gap-2 ${tab === "invoices" ? "font-medium text-[var(--vx-ink)] border-b-2 border-[var(--vx-ink)]" : "text-muted-foreground hover:text-foreground"}`}
 >
 <Receipt size={16} /> Invoices
 </button>
 </div>

 <div className="max-w-3xl">
 {tab === "subscriptions" && (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
 {subsLoading ? (
 <div className="h-40 w-full bg-muted rounded-xl animate-pulse"></div>
 ) : subsError ? (
 <div className="p-6 text-center text-destructive">
 <p>Failed to load subscriptions.</p>
 <button onClick={() => mutateSubs()} className="btn btn-outline text-xs mt-2">Try again</button>
 </div>
 ) : subscriptions?.length ? subscriptions.map((sub: any) => (
 <div key={sub.id} className="vx-card p-6 border-l-4 border-[var(--vx-jade)] relative overflow-hidden mb-4">
 <div className="absolute -right-10 -top-10 text-[var(--vx-jade)]/10">
 <ActivityIcon />
 </div>
 <div className="flex justify-between items-start">
 <div>
 <span className="badge badge-jade mb-2 text-xs">Active</span>
 <h2 className="font-display text-2xl font-medium">{sub.product_name}</h2>
 <p className="mt-2 text-lg">$450 / month</p>
 </div>
 <button onClick={handleManageSub} className="btn btn-outline flex items-center gap-2 text-sm">
 <SettingsIcon /> Manage
 </button>
 </div>
 <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
 <div>
 <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Started On</p>
 <p className="font-medium">{new Date(sub.created_at).toLocaleDateString()}</p>
 </div>
 <div>
 <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Payment Method</p>
 <p className="font-medium flex items-center gap-2"><CreditCard size={14} /> •••• 4242</p>
 </div>
 </div>
 </div>
 )) : <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No active subscriptions found.</div>}
 </div>
 )}

 {tab === "orders" && (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
 {ordersLoading ? (
 <div className="space-y-4">
 <div className="h-64 w-full bg-muted rounded-xl animate-pulse"></div>
 <div className="h-24 w-full bg-muted rounded-xl animate-pulse"></div>
 </div>
 ) : ordersError ? (
 <div className="p-6 text-center text-destructive">
 <p>Failed to load orders.</p>
 <button onClick={() => mutateOrders()} className="btn btn-outline text-xs mt-2">Try again</button>
 </div>
 ) : !orders || orders.length === 0 ? (
 <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No orders found.</div>
 ) : (
 <>
 <div className="vx-card p-6 relative">
 <h3 className="font-medium mb-4 flex items-center gap-2 border-b border-border pb-3">
 <Package size={18} className="text-[var(--vx-jade)]" /> Order #ORD-7391-B
 </h3>
 <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
 <div>
 <p className="font-semibold text-lg">VitalityX DNA Methylation Kit</p>
 <p className="text-sm text-muted-foreground mt-1">Ordered on Jun 22, 2026</p>
 </div>
 <span className="badge badge-amber flex items-center gap-1"><Truck size={12} /> In Transit</span>
 </div>
 
 {/* Tracking Progress */}
 <div className="relative pt-2 pb-2">
 <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full overflow-hidden">
 <div className="w-[60%] h-full bg-[var(--vx-jade)] rounded-full"></div>
 </div>
 <div className="relative flex justify-between text-xs font-medium">
 <div className="flex flex-col items-center gap-2 text-[var(--vx-jade)]">
 <span className="h-4 w-4 rounded-full bg-[var(--vx-jade)] ring-4 ring-background z-10" />
 <span>Confirmed</span>
 </div>
 <div className="flex flex-col items-center gap-2 text-[var(--vx-jade)]">
 <span className="h-4 w-4 rounded-full bg-[var(--vx-jade)] ring-4 ring-background z-10" />
 <span>Shipped</span>
 </div>
 <div className="flex flex-col items-center gap-2 text-muted-foreground">
 <span className="h-4 w-4 rounded-full bg-muted ring-4 ring-background z-10" />
 <span>Out for Delivery</span>
 </div>
 <div className="flex flex-col items-center gap-2 text-muted-foreground">
 <span className="h-4 w-4 rounded-full bg-muted ring-4 ring-background z-10" />
 <span>Delivered</span>
 </div>
 </div>
 </div>

 <div className="mt-8 bg-muted/30 p-4 rounded-lg flex items-start gap-4">
 <Truck size={20} className="text-muted-foreground mt-0.5 shrink-0" />
 <div>
 <p className="text-sm font-medium">Estimated Delivery: Tomorrow by 8 PM</p>
 <p className="text-xs text-muted-foreground mt-1">FedEx Tracking: 39182390182301</p>
 </div>
 </div>
 </div>

 {orders?.map((order: any) => (
 <div key={order.id} className="vx-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h3 className="font-medium text-lg">Order #{order.id.substring(0,8).toUpperCase()}</h3>
 <p className="text-sm text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
 </div>
 <div className="flex items-center gap-4">
 <span className="badge badge-jade"><CheckCircle2 size={12} className="inline mr-1" /> Delivered</span>
 <button className="text-sm font-medium underline text-muted-foreground hover:text-foreground">View details</button>
 </div>
 </div>
 ))}
 </>
 )}
 </div>
 )}

 {tab === "invoices" && (
 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
 {ordersLoading ? (
 <div className="space-y-4">
 <div className="h-16 w-full bg-muted rounded-xl animate-pulse"></div>
 <div className="h-16 w-full bg-muted rounded-xl animate-pulse"></div>
 </div>
 ) : ordersError ? (
 <div className="p-6 text-center text-destructive">
 <p>Failed to load invoices.</p>
 <button onClick={() => mutateOrders()} className="btn btn-outline text-xs mt-2">Try again</button>
 </div>
 ) : !orders || orders.length === 0 ? (
 <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No invoices found.</div>
 ) : orders?.map((order: any) => (
 <div key={order.id} className="vx-card p-4 flex justify-between items-center group">
 <div className="flex items-center gap-4">
 <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
 <Receipt size={18} />
 </div>
 <div>
 <p className="font-medium text-sm">Invoice INV-{order.id.substring(0,6).toUpperCase()}</p>
 <p className="text-xs text-muted-foreground">{order.items?.[0]?.name || 'Supplement Order'} · ${(order.amount_total/100).toFixed(2)}</p>
 </div>
 </div>
 <div className="flex items-center gap-6">
 <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
 <button className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition">
 <ExternalLink size={16} />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}

// Quick icons to keep imports clean
function ActivityIcon() {
 return <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
}
function SettingsIcon() {
 return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}
