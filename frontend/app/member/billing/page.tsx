"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Package, CreditCard, Receipt, ExternalLink, Calendar, Truck, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { toast } from "sonner";
import { useHighlight } from "@/hooks/use-highlight";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { ModernEmptyState } from "@/components/dashboard/ModernEmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

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

  // Collect IDs from both subscriptions and orders for highlighting
  const allIds = [
    ...(subscriptions?.map((s: any) => s.id) || []),
    ...(orders?.map((o: any) => o.id) || [])
  ];
  useHighlight(allIds);

  const handleManageSub = () => {
    toast.info("Customer portal opening...");
    // In a real app, this would redirect to the Stripe Customer Portal
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" data-testid="member-billing-page">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-medium tracking-tight">Billing & Orders</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your subscriptions, orders, and view past invoices.</p>
      </div>
      
      <div className="flex gap-2 border-b border-border/50 pb-2 text-sm overflow-x-auto mb-8 custom-scrollbar">
        <button 
          onClick={() => setTab("subscriptions")}
          className={`whitespace-nowrap px-4 py-2.5 rounded-full flex items-center gap-2 transition-all ${tab === "subscriptions" ? "bg-[var(--vx-jade)]/10 text-[var(--vx-jade)] font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
        >
          <Calendar size={16} /> Subscriptions
        </button>
        <button 
          onClick={() => setTab("orders")}
          className={`whitespace-nowrap px-4 py-2.5 rounded-full flex items-center gap-2 transition-all ${tab === "orders" ? "bg-[var(--vx-jade)]/10 text-[var(--vx-jade)] font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
        >
          <Package size={16} /> Orders & Tracking
        </button>
        <button 
          onClick={() => setTab("invoices")}
          className={`whitespace-nowrap px-4 py-2.5 rounded-full flex items-center gap-2 transition-all ${tab === "invoices" ? "bg-[var(--vx-jade)]/10 text-[var(--vx-jade)] font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
        >
          <Receipt size={16} /> Invoices
        </button>
      </div>

      <div className="max-w-4xl">
        {tab === "subscriptions" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {subsLoading ? (
              <div className="space-y-4">
                <div className="h-48 w-full bg-muted/50 rounded-[24px] animate-pulse"></div>
                <div className="h-48 w-full bg-muted/50 rounded-[24px] animate-pulse"></div>
              </div>
            ) : subsError ? (
              <div className="p-8 text-center text-destructive bg-destructive/5 rounded-2xl">
                <p className="font-medium">Failed to load subscriptions.</p>
                <button onClick={() => mutateSubs()} className="btn btn-outline text-xs mt-4">Try again</button>
              </div>
            ) : subscriptions?.length ? subscriptions.map((sub: any) => (
              <PremiumCard key={sub.id} id={sub.id} className="relative overflow-hidden group">
                <div className="absolute -right-16 -top-16 text-[var(--vx-jade)]/5 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12">
                  <Activity size={240} strokeWidth={1} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <div className="mb-3">
                        <StatusBadge status="success" label="Active Subscription" />
                      </div>
                      <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">{sub.product_name}</h2>
                      {sub.price_cents ? (
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-3xl font-bold tracking-tight">${(sub.price_cents / 100).toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">/ month</span>
                        </div>
                      ) : null}
                    </div>
                    <button onClick={handleManageSub} className="btn bg-white/5 border border-border hover:border-foreground/20 hover:bg-white/10 flex items-center gap-2 text-sm shadow-sm transition-all sm:shrink-0 w-full sm:w-auto justify-center">
                      <SettingsIcon /> Manage Plan
                    </button>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/50 pt-6">
                    <div className="bg-muted/20 p-4 rounded-xl border border-border/50">
                      <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1.5 font-semibold">Started On</p>
                      <p className="font-medium text-[15px]">{new Date(sub.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="bg-muted/20 p-4 rounded-xl border border-border/50">
                      <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1.5 font-semibold">Payment Method</p>
                      <p className="font-medium flex items-center gap-2 text-[15px]">
                        <span className="w-8 h-5 bg-card rounded border border-border flex items-center justify-center shrink-0">
                          <CreditCard size={12} className="text-muted-foreground" />
                        </span>
                        •••• 4242
                      </p>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            )) : (
              <ModernEmptyState
                icon={<Calendar size={32} />}
                title="No active subscriptions"
                description="You don't have any active supplement or protocol subscriptions."
                actionLabel="Explore Protocols"
                onAction={() => window.location.href = "/member/protocol"}
              />
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {ordersLoading ? (
              <div className="space-y-4">
                <div className="h-80 w-full bg-muted/50 rounded-[24px] animate-pulse"></div>
                <div className="h-24 w-full bg-muted/50 rounded-[24px] animate-pulse"></div>
              </div>
            ) : ordersError ? (
              <div className="p-8 text-center text-destructive bg-destructive/5 rounded-2xl">
                <p className="font-medium">Failed to load orders.</p>
                <button onClick={() => mutateOrders()} className="btn btn-outline text-xs mt-4">Try again</button>
              </div>
            ) : !orders || orders.length === 0 ? (
              <ModernEmptyState
                icon={<Package size={32} />}
                title="No orders found"
                description="You haven't placed any orders yet."
              />
            ) : (
              <>
                {/* Featured active order (mock data for visualization as in original) */}
                <PremiumCard className="relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/50 pb-5 mb-6 gap-4">
                    <h3 className="font-display text-lg font-medium flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--vx-jade)]/10 flex items-center justify-center">
                        <Package size={16} className="text-[var(--vx-jade)]" />
                      </div>
                      Order #ORD-7391-B
                    </h3>
                    <StatusBadge status="warning" label="In Transit" icon={<Truck size={12} />} />
                  </div>
                  
                  <div className="mb-8">
                    <p className="font-semibold text-xl tracking-tight">VitalityX DNA Methylation Kit</p>
                    <p className="text-sm text-muted-foreground mt-1.5">Ordered on June 22, 2026</p>
                  </div>
                  
                  {/* Modern Tracking Progress */}
                  <div className="relative pt-4 pb-6">
                    <div className="absolute top-[28px] left-8 right-8 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="w-[60%] h-full bg-gradient-to-r from-[var(--vx-jade)] to-[var(--vx-emerald,var(--vx-jade))] rounded-full"></div>
                    </div>
                    
                    <div className="relative flex justify-between z-10 px-2 sm:px-6">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[var(--vx-jade)] ring-4 ring-card flex items-center justify-center shadow-sm">
                          <CheckCircle2 size={14} className="text-[var(--vx-ink)]" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--vx-jade)] hidden sm:block">Confirmed</span>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[var(--vx-jade)] ring-4 ring-card flex items-center justify-center shadow-sm">
                          <CheckCircle2 size={14} className="text-[var(--vx-ink)]" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--vx-jade)] hidden sm:block">Shipped</span>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-[var(--vx-jade)] bg-card ring-4 ring-card flex items-center justify-center shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-[var(--vx-jade)] animate-pulse"></div>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground hidden sm:block">Out for Delivery</span>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-border/50 ring-4 ring-card flex items-center justify-center shadow-sm"></div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:block">Delivered</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-muted/20 border border-border/50 p-5 rounded-2xl flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                    <div className="w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center shrink-0">
                      <Truck size={20} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Estimated Delivery: Tomorrow by 8 PM</p>
                      <p className="text-xs text-muted-foreground mt-1">FedEx Tracking: <span className="text-foreground/80 cursor-pointer hover:underline">39182390182301</span></p>
                    </div>
                    <button className="btn btn-outline text-xs whitespace-nowrap w-full sm:w-auto justify-center">Track Package</button>
                  </div>
                </PremiumCard>

                <h3 className="font-display text-xl font-medium tracking-tight mt-10 mb-4">Past Orders</h3>
                
                {orders?.map((order: any) => (
                  <PremiumCard interactive key={order.id} id={order.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
                        <Package size={16} className="text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[15px] group-hover:text-[var(--vx-jade)] transition-colors">Order #{order.id.substring(0,8).toUpperCase()}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0 ml-14 sm:ml-0">
                      <StatusBadge status="success" label="Delivered" icon={<CheckCircle2 size={12} />} />
                      <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                        View details <ChevronRight size={14} />
                      </button>
                    </div>
                  </PremiumCard>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "invoices" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {ordersLoading ? (
              <div className="space-y-4">
                <div className="h-20 w-full bg-muted/50 rounded-2xl animate-pulse"></div>
                <div className="h-20 w-full bg-muted/50 rounded-2xl animate-pulse"></div>
              </div>
            ) : ordersError ? (
              <div className="p-8 text-center text-destructive bg-destructive/5 rounded-2xl">
                <p className="font-medium">Failed to load invoices.</p>
                <button onClick={() => mutateOrders()} className="btn btn-outline text-xs mt-4">Try again</button>
              </div>
            ) : !orders || orders.length === 0 ? (
              <ModernEmptyState
                icon={<Receipt size={32} />}
                title="No invoices found"
                description="You don't have any billing history yet."
              />
            ) : orders?.map((order: any) => (
              <PremiumCard interactive key={order.id} id={order.id} className="p-4 flex justify-between items-center group transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground shadow-sm">
                    <Receipt size={20} className="group-hover:text-[var(--vx-jade)] transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium text-[15px] group-hover:text-[var(--vx-jade)] transition-colors">Invoice INV-{order.id.substring(0,6).toUpperCase()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground max-w-[120px] sm:max-w-none truncate">{order.items?.[0]?.name || 'Supplement Order'}</p>
                      <span className="text-xs text-muted-foreground/30">•</span>
                      <p className="text-xs font-medium text-foreground">${(order.amount_total/100).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-sm font-medium text-muted-foreground hidden sm:block">{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <button className="text-muted-foreground hover:text-[var(--vx-ink)] hover:bg-[var(--vx-jade)]/10 p-2.5 rounded-xl border border-transparent hover:border-[var(--vx-jade)]/20 transition-all shadow-sm">
                    <ExternalLink size={16} />
                  </button>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Quick icons to keep imports clean
function SettingsIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}
