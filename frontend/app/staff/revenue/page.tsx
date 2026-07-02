"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/portal/user-provider";
import { DollarSign, ShieldAlert, TrendingUp, Calendar, CreditCard, Inbox, ShoppingBag, ArrowUpRight, BarChart2 } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevenueChart } from "@/components/staff/RevenueChart";

const supabase = createClient();

export default function RevenueDashboardPage() {
  const { profile } = useUser();
  const [filterRange, setFilterRange] = useState<"30" | "90" | "all">("30");

  const { data: revenueData, isLoading, error } = useSWR(["admin-revenue-data", filterRange], async () => {
    if (profile?.role !== "Admin") return null;

    // Get orders
    let query = supabase.from("orders").select("*, profiles!orders_member_id_fkey(full_name, email)").order("created_at", { ascending: false });

    if (filterRange !== "all") {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number(filterRange));
      query = query.gte("created_at", daysAgo.toISOString());
    }

    const { data: orders, error: ordersErr } = await query;
    if (ordersErr) throw ordersErr;

    // Get subscriptions
    const { data: subs, error: subsErr } = await supabase
      .from("supplement_subscriptions")
      .select("*");
    
    if (subsErr) throw subsErr;

    return { orders: orders || [], subscriptions: subs || [] };
  });

  if (profile?.role !== "Admin") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <EmptyState 
          icon={ShieldAlert}
          title="Access Restricted"
          description="Only users with the role of Admin are authorized to access the Revenue Dashboard."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-6">
        <div className="h-16 w-1/3 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
          <div className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
          <div className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
          <div className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
        </div>
        <div className="h-[350px] w-full bg-muted/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !revenueData) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-center text-destructive font-medium">Failed to load revenue analytics.</p>
      </div>
    );
  }

  const { orders, subscriptions } = revenueData;

  // Process numbers
  const totalSalesCents = orders
    .filter(o => o.status === "paid" || o.status === "completed")
    .reduce((sum, o) => sum + (o.amount_total || 0), 0);
  
  const totalSales = totalSalesCents / 100;

  const pendingSalesCents = orders
    .filter(o => o.status === "pending")
    .reduce((sum, o) => sum + (o.amount_total || 0), 0);
  
  const pendingSales = pendingSalesCents / 100;

  const activeSubs = subscriptions.filter(s => s.status === "active");

  // Product breakdown calculation
  const itemCounts: Record<string, { count: number; totalCents: number }> = {};
  orders
    .filter(o => o.status === "paid" || o.status === "completed")
    .forEach(o => {
      const items = o.items || [];
      items.forEach((it: any) => {
        const name = it.name || "Unknown Product";
        const quantity = Number(it.quantity) || 1;
        const amt = Number(it.amount) || (o.amount_total / items.length) || 0;
        
        if (!itemCounts[name]) {
          itemCounts[name] = { count: 0, totalCents: 0 };
        }
        itemCounts[name].count += quantity;
        itemCounts[name].totalCents += amt * quantity;
      });
    });

  const productBreakdown = Object.entries(itemCounts).map(([name, val]) => ({
    name,
    count: val.count,
    revenue: val.totalCents / 100
  })).sort((a, b) => b.revenue - a.revenue);

  // Re-map orders structure to match RevenueChart signature: items with `amount` and `created_at`
  const formattedOrdersForChart = orders
    .filter(o => o.status === "paid" || o.status === "completed")
    .map(o => ({
      amount: o.amount_total,
      created_at: o.created_at
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10" data-testid="staff-revenue-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--vx-jade)]/10 text-[var(--vx-jade)] rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight">Revenue Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Monitor platform billing, subscription numbers, and sales transactions.</p>
          </div>
        </div>

        <select 
          value={filterRange} 
          onChange={(e: any) => setFilterRange(e.target.value)} 
          className="vx-input min-w-[150px] self-start sm:self-center"
        >
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <PremiumCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Gross Revenue</span>
              <DollarSign size={16} className="text-[var(--vx-jade)]" />
            </div>
            <p className="font-display text-3xl font-medium tracking-tight mt-1">
              ${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-[10px] text-green-500 font-semibold uppercase tracking-wider flex items-center gap-1 mt-4">
            <TrendingUp size={12} /> Live Paid Sales
          </div>
        </PremiumCard>

        <PremiumCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Active Subscriptions</span>
              <ShoppingBag size={16} className="text-blue-500" />
            </div>
            <p className="font-display text-3xl font-medium tracking-tight mt-1">
              {activeSubs.length}
            </p>
          </div>
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-4">
            Supplement Plans
          </div>
        </PremiumCard>

        <PremiumCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Pending Payments</span>
              <CreditCard size={16} className="text-amber-500" />
            </div>
            <p className="font-display text-3xl font-medium tracking-tight mt-1">
              ${pendingSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider mt-4">
            Awaiting Checkout Completion
          </div>
        </PremiumCard>

        <PremiumCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Completed Orders</span>
              <Inbox size={16} className="text-purple-500" />
            </div>
            <p className="font-display text-3xl font-medium tracking-tight mt-1">
              {orders.filter(o => o.status === "paid" || o.status === "completed").length}
            </p>
          </div>
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-4">
            Total Invoiced
          </div>
        </PremiumCard>
      </div>

      {/* Chart Section */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <PremiumCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
            <h2 className="font-display text-lg font-medium flex items-center gap-2">
              <BarChart2 size={18} className="text-[var(--vx-jade)]" /> Daily Revenue Trend
            </h2>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Paid Sales</span>
          </div>
          <RevenueChart data={formattedOrdersForChart} />
        </PremiumCard>

        {/* Product breakdown */}
        <PremiumCard className="p-6 flex flex-col">
          <h2 className="font-display text-lg font-medium border-b border-border/50 pb-4 mb-6">Product / Program Breakdown</h2>
          {productBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center flex-1 flex items-center justify-center">No sales registered in this timeframe.</p>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto">
              {productBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-border/20 pb-2">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.count} unit{item.count > 1 ? "s" : ""} sold</p>
                  </div>
                  <p className="font-mono font-bold">${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </div>

      {/* Recent Transactions list */}
      <PremiumCard className="p-6">
        <h2 className="font-display text-xl font-medium border-b border-border/50 pb-4 mb-6">Recent Transactions</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No transactions logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 px-4">Customer</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-semibold">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.profiles?.full_name || "Guest Checkout"}
                      <span className="block text-xs text-muted-foreground mt-0.5">{order.profiles?.email || ""}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      ${(order.amount_total / 100).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge 
                        status={order.status === "paid" || order.status === "completed" ? "success" : order.status === "pending" ? "warning" : "danger"} 
                        label={order.status} 
                      />
                    </td>
                    <td className="py-3.5 pl-4 text-right text-muted-foreground text-xs font-medium">
                      {new Date(order.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PremiumCard>
    </div>
  );
}
