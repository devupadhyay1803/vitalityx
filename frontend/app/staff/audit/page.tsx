"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, ShieldAlert, LogIn, LogOut, FileText, Calendar, CreditCard, User, ListChecks, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Activity } from "lucide-react";
import { useUser } from "@/components/portal/user-provider";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumCard } from "@/components/ui/PremiumCard";

const supabase = createClient();

const getActionIcon = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes("login")) return LogIn;
  if (a.includes("logout")) return LogOut;
  if (a.includes("document") || a.includes("upload")) return FileText;
  if (a.includes("appointment") || a.includes("session")) return Calendar;
  if (a.includes("payment") || a.includes("billing")) return CreditCard;
  if (a.includes("profile") || a.includes("user")) return User;
  if (a.includes("protocol") || a.includes("plan")) return ListChecks;
  return Activity;
};

const getStatusDetails = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes("failed") || a.includes("error")) {
    return { color: "text-red-500", bg: "bg-red-500/10", label: "Failed", Icon: AlertCircle };
  }
  if (a.includes("warning") || a.includes("unauthorized")) {
    return { color: "text-amber-500", bg: "bg-amber-500/10", label: "Warning", Icon: ShieldAlert };
  }
  return { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Success", Icon: CheckCircle2 };
};

export default function StaffAuditPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const { profile } = useUser();

  const { data: logs, isLoading } = useSWR("staff-audit-logs", async () => {
    if (profile?.role !== "Admin") return null;
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*, profiles!actor_id(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(200);
    
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  });

  if (profile?.role !== "Admin") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10" data-testid="staff-audit-page">
        <EmptyState 
           icon={ShieldAlert}
           title="Access Restricted"
           description="You do not have permission to view audit logs. This area is restricted to administrators."
        />
      </div>
    );
  }

  const actions = Array.from(new Set((logs || []).map((l: any) => l.action)));

  const filteredLogs = (logs || []).filter((log: any) => {
    const matchSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.profiles?.email || "").toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "All" || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10" data-testid="staff-audit-page">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-[var(--vx-coral)]/10 text-[var(--vx-coral)] rounded-xl">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="font-display text-4xl font-medium">Audit Logs</h1>
          <p className="mt-1 text-muted-foreground">Track system activity and security events.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 my-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text"
            placeholder="Search by action, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="vx-input pl-10 w-full"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <select 
            value={actionFilter} 
            onChange={(e) => setActionFilter(e.target.value)}
            className="vx-input pl-10 w-full appearance-none"
          >
            <option value="All">All Actions</option>
            {actions.map((a: any) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <PremiumCard>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 bg-muted rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                  <div className="h-8 w-24 bg-muted rounded-full shrink-0" />
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12">
              <EmptyState 
                icon={ShieldAlert}
                title="No logs found"
                description="There are no audit logs matching your current filters."
                action={
                  (search || actionFilter !== "All") ? (
                    <button onClick={() => { setSearch(""); setActionFilter("All"); }} className="text-[var(--vx-ink)] hover:underline mt-4 text-sm font-medium">
                      Clear Filters
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredLogs.map((log: any) => {
                const ActionIcon = getActionIcon(log.action);
                const status = getStatusDetails(log.action);
                const isExpanded = expandedLogId === log.id;

                return (
                  <div key={log.id} className="group hover:bg-muted/30 transition-colors">
                    <div 
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${status.bg} ${status.color}`}>
                        <ActionIcon size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0 grid sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">{log.action}</span>
                            <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                              <status.Icon size={10} />
                              {status.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                            {log.ip_address && (
                              <>
                                <span>•</span>
                                <span className="font-mono">{log.ip_address}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-sm truncate">{log.profiles?.full_name || "Unknown User"}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground truncate">{log.profiles?.email}</span>
                            {log.actor_role && (
                              <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                {log.actor_role}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center self-end sm:self-auto text-muted-foreground group-hover:text-foreground transition-colors">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-border bg-muted/10 animate-in slide-in-from-top-2">
                        <div className="grid sm:grid-cols-2 gap-6 text-sm">
                          <div>
                            <h4 className="font-medium text-muted-foreground mb-2 text-xs uppercase tracking-wider">Resource Details</h4>
                            {log.resource_type ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                  <span className="text-muted-foreground">Type:</span>
                                  <span className="col-span-2 font-mono">{log.resource_type}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <span className="text-muted-foreground">ID:</span>
                                  <span className="col-span-2 font-mono text-xs break-all">{log.resource_id}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-muted-foreground italic">No resource details</p>
                            )}
                          </div>

                          <div>
                            <h4 className="font-medium text-muted-foreground mb-2 text-xs uppercase tracking-wider">Metadata</h4>
                            {log.metadata && Object.keys(log.metadata).length > 0 ? (
                              <pre className="bg-background border border-border rounded-lg p-3 text-xs overflow-x-auto text-muted-foreground font-mono">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            ) : (
                              <p className="text-muted-foreground italic">No additional metadata</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  );
}
