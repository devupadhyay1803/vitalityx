"use client";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";
import { useHighlight } from "@/hooks/use-highlight";

const supabase = createClient();

import { PremiumCard } from "@/components/ui/PremiumCard";
import { StatusBadge, StatusType } from "@/components/ui/StatusBadge";
import { ModernEmptyState } from "@/components/dashboard/ModernEmptyState";
import { Pill } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import Image from "next/image";

export default function SupplementsPage() {
  const { data, error, isLoading, mutate } = useSWR("supplements", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: subs, error } = await supabase.from("supplement_subscriptions").select("*").eq("member_id", user.id).order("created_at", { ascending: false });
    if (error) throw error;
    return { userId: user.id, subs: subs || [] };
  });

  useHighlight(data?.subs.map((s: any) => s.id) || []);

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
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="h-10 w-48 bg-muted rounded animate-pulse mb-2"></div>
      <div className="h-4 w-64 bg-muted rounded animate-pulse mb-8"></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="h-40 bg-muted/50 rounded-2xl animate-pulse"></div>
        <div className="h-40 bg-muted/50 rounded-2xl animate-pulse"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-center">
      <p className="text-destructive font-medium">Failed to load subscriptions.</p>
      <button onClick={() => mutate()} className="mt-4 btn btn-outline text-xs">Try again</button>
    </div>
  );

  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10" data-testid="member-supplements-page">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Supplements</h1>
          <p className="mt-2 text-muted-foreground text-lg">Manage your active longevity protocols and subscriptions.</p>
        </div>
        <Link href="/products" className="btn btn-primary">
          Browse Apothecary
        </Link>
      </div>

      {data.subs.length === 0 ? (
        <ModernEmptyState 
          icon={<Pill size={32} />}
          title="No Active Subscriptions"
          description="You aren't currently subscribed to any longevity supplements. Explore our apothecary to build your stack."
          actionLabel="Browse Apothecary"
          actionHref="/products"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.subs.map((s: any) => {
            const statusMap: Record<string, StatusType> = {
              "active": "success",
              "paused": "warning",
              "cancelled": "danger"
            };
            
            return (
              <PremiumCard key={s.id} id={s.id} className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden border border-border relative">
                      {(() => {
                        const product = Object.values(PRODUCTS).find(p => p.name === s.product_name);
                        return product?.image ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <Pill size={24} className="text-muted-foreground" />
                        );
                      })()}
                    </div>
                    <StatusBadge status={statusMap[s.status] || "neutral"} label={s.status} />
                  </div>
                  
                  <h3 className="font-display text-xl mb-1">{s.product_name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">Monthly Subscription</p>
                </div>
                
                <div className="flex gap-2 mt-auto pt-4 border-t border-border/50">
                  {s.status === "active" && (
                    <button data-testid={`pause-${s.id}`} onClick={() => setStatus(s.id, s.stripe_subscription_id, "paused")} className="btn btn-outline text-xs flex-1">
                      Pause
                    </button>
                  )}
                  {s.status === "paused" && (
                    <button data-testid={`resume-${s.id}`} onClick={() => setStatus(s.id, s.stripe_subscription_id, "paused")} className="btn btn-outline text-xs flex-1">
                      Resume
                    </button>
                  )}
                  {s.status !== "cancelled" && (
                    <button data-testid={`cancel-${s.id}`} onClick={() => setStatus(s.id, s.stripe_subscription_id, "cancelled")} className="btn btn-danger text-xs flex-1">
                      Cancel
                    </button>
                  )}
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
