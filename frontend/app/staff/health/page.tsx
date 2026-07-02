"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/portal/user-provider";
import { ShieldAlert, Activity, Database, HardDrive, Wifi, CreditCard, RefreshCw, Server, Users, Cloud, CheckCircle, Clock } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";

export default function PlatformHealthPage() {
  const { profile } = useUser();
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30s auto-refresh

  const { data: health, isLoading, error, mutate } = useSWR(
    "admin-platform-health",
    async () => {
      if (profile?.role !== "Admin") return null;
      const res = await fetch("/api/admin/health");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load platform health status");
      }
      return res.json();
    },
    { refreshInterval }
  );

  if (profile?.role !== "Admin") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <EmptyState 
          icon={ShieldAlert}
          title="Access Restricted"
          description="Only users with the role of Admin are authorized to access the Platform Health dashboard."
        />
      </div>
    );
  }

  const handleRefresh = async () => {
    toast.promise(mutate(), {
      loading: "Probing system endpoints...",
      success: "Platform status updated.",
      error: "Failed to fetch status."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "degraded":
      case "warning":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-red-500 bg-red-500/10 border-red-500/20";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10" data-testid="staff-health-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--vx-jade)]/10 text-[var(--vx-jade)] rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight">Platform Health</h1>
            <p className="mt-1 text-muted-foreground">Monitor real-time system dependencies, storage metrics, and backups.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="btn btn-outline text-xs h-9 flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh Status
          </button>
        </div>
      </div>

      {isLoading && !health ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-44 bg-muted/50 rounded-2xl animate-pulse" />
          <div className="h-44 bg-muted/50 rounded-2xl animate-pulse" />
          <div className="h-44 bg-muted/50 rounded-2xl animate-pulse" />
        </div>
      ) : error ? (
        <div className="vx-card p-8 text-center text-destructive">
          <p className="font-medium">Failed to establish connection to the health telemetry engine.</p>
          <button onClick={handleRefresh} className="btn btn-outline text-xs mt-4">Try again</button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Active Users & Quick Overview bar */}
          <div className="grid gap-4 sm:grid-cols-3">
            <PremiumCard className="p-4 flex items-center gap-4 bg-gradient-to-br from-card to-muted/10 border-border/50">
              <div className="w-10 h-10 rounded-full bg-[var(--vx-jade)]/10 flex items-center justify-center text-[var(--vx-jade)] shrink-0">
                <Users size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Active Users (30m)</p>
                <p className="text-2xl font-bold mt-0.5">{health.stats.active_users}</p>
              </div>
            </PremiumCard>

            <PremiumCard className="p-4 flex items-center gap-4 bg-gradient-to-br from-card to-muted/10 border-border/50">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Database size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Registered Users</p>
                <p className="text-2xl font-bold mt-0.5">{health.stats.total_registered_users}</p>
              </div>
            </PremiumCard>

            <PremiumCard className="p-4 flex items-center gap-4 bg-gradient-to-br from-card to-muted/10 border-border/50">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <HardDrive size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Uploaded Lab Documents</p>
                <p className="text-2xl font-bold mt-0.5">{health.stats.storage_files_count}</p>
              </div>
            </PremiumCard>
          </div>

          {/* Infrastructure dependencies */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Core Infrastructure Status</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              
              {/* Supabase DB */}
              <PremiumCard className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Database size={16} className="text-muted-foreground" /> Database
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(health.services.supabase_db.status)}`}>
                      {health.services.supabase_db.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    Supabase PostgreSQL relational schemas & queries.
                  </p>
                </div>
                <div className="border-t border-border/30 pt-3 mt-6 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Latency:</span>
                  <span className="font-mono font-semibold text-foreground">{health.services.supabase_db.latency_ms}ms</span>
                </div>
              </PremiumCard>

              {/* Supabase Storage */}
              <PremiumCard className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <HardDrive size={16} className="text-muted-foreground" /> Object Storage
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(health.services.supabase_storage.status)}`}>
                      {health.services.supabase_storage.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    Bucket for secure PDF lab reports and genetic sequence uploads.
                  </p>
                </div>
                <div className="border-t border-border/30 pt-3 mt-6 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Latency:</span>
                  <span className="font-mono font-semibold text-foreground">{health.services.supabase_storage.latency_ms}ms</span>
                </div>
              </PremiumCard>

              {/* Realtime Sockets */}
              <PremiumCard className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Wifi size={16} className="text-muted-foreground" /> Realtime API
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(health.services.supabase_realtime.status)}`}>
                      {health.services.supabase_realtime.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    Websockets for real-time care team chat sync.
                  </p>
                </div>
                <div className="border-t border-border/30 pt-3 mt-6 flex justify-between items-center text-xs text-muted-foreground">
                  <span>State:</span>
                  <span className="font-semibold text-foreground">Listening</span>
                </div>
              </PremiumCard>

              {/* Stripe */}
              <PremiumCard className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <CreditCard size={16} className="text-muted-foreground" /> Stripe Gateway
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(health.services.stripe.status)}`}>
                      {health.services.stripe.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    API integration for payments and subscriptions.
                  </p>
                </div>
                <div className="border-t border-border/30 pt-3 mt-6 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Latency:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {health.services.stripe.status === "misconfigured" ? "—" : `${health.services.stripe.latency_ms}ms`}
                  </span>
                </div>
              </PremiumCard>

            </div>
          </div>

          {/* Backup details */}
          <div className="max-w-2xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Database Backup Telemetry</h2>
            <PremiumCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-border/40 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 text-green-600 rounded-xl">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Automated System Backups</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Continuous data replication + daily snapshot runs.</p>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-green-600 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                  All Clear
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Last Backup</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(health.backup.last_run).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(health.backup.last_run).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Backup Size</p>
                  <p className="text-sm font-semibold text-foreground">{health.backup.size_mb} MB</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Run Duration</p>
                  <p className="text-sm font-semibold text-foreground">{health.backup.duration_sec}s</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Schema Type</p>
                  <p className="text-sm font-semibold text-foreground">{health.backup.type.split(" ")[1] || "PG_Dump"}</p>
                </div>
              </div>
            </PremiumCard>
          </div>

        </div>
      )}
    </div>
  );
}
