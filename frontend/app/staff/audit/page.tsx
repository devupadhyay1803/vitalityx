"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, ShieldAlert } from "lucide-react";

export default function StaffAuditPage() {
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const { data: logs, isLoading } = useSWR("staff-audit-logs", async () => {
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
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="staff-audit-page">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-[var(--vx-coral)]/10 text-[var(--vx-coral)] rounded-xl">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="font-display text-4xl font-medium">Audit Logs</h1>
          <p className="mt-1 text-muted-foreground">Immutable compliance and activity tracking.</p>
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

      <div className="vx-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground animate-pulse">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="text-muted-foreground">No logs match your filters.</p>
                    {(search || actionFilter !== "All") && (
                      <button onClick={() => { setSearch(""); setActionFilter("All"); }} className="mt-2 text-sm text-[var(--vx-ink)] hover:underline">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{log.profiles?.full_name || "Unknown User"}</p>
                      <p className="text-xs text-muted-foreground">{log.profiles?.email}</p>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{log.actor_role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-amber">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.resource_type ? (
                        <>
                          <span className="font-mono text-muted-foreground">{log.resource_type}</span>
                          <p className="text-[10px] text-muted-foreground truncate w-32" title={log.resource_id}>{log.resource_id}</p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {log.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
