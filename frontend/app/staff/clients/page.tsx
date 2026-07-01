"use client";
import useSWR from "swr";
import Link from "next/link";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Search, X, ArrowUpDown } from "lucide-react";

const supabase = createClient();

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

export default function ClientsPage() {
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  
  const { data, error, isLoading, mutate } = useSWR("staff-clients", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    // Admins get all clients, regular staff get assigned clients
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isAdmin = profile?.role && ["Admin", "Super Admin", "Operations"].includes(profile.role);
    
    let query = supabase.from(isAdmin ? "client_records" : "care_team_assignments").select(isAdmin ? "member_id, created_at, profiles!client_records_member_id_fkey(id, full_name, email, health_goal)" : "member_id, created_at, profiles!care_team_assignments_member_id_fkey(id, full_name, email, health_goal)");
    
    if (!isAdmin) {
      query = query.eq("staff_id", user.id);
    }
    
    const { data: results, error: queryError } = await query;
    if (queryError) throw queryError;
    
    // Deduplicate in case of multiple assignments for the same member
    const unique = Array.from(new Map((results || []).map((item: any) => [item.member_id, item])).values());
    return unique;
  });

  const filteredAndSorted = useMemo(() => {
    let result = (data || []).filter((c: any) => {
      if (!q) return true;
      const p = c.profiles || {};
      const searchLower = q.toLowerCase();
      return (p.full_name || "").toLowerCase().includes(searchLower) || 
             (p.email || "").toLowerCase().includes(searchLower);
    });

    return result.sort((a: any, b: any) => {
      const nameA = (a.profiles?.full_name || "").toLowerCase();
      const nameB = (b.profiles?.full_name || "").toLowerCase();
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      switch (sortBy) {
        case "name_asc": return nameA.localeCompare(nameB);
        case "name_desc": return nameB.localeCompare(nameA);
        case "oldest": return dateA - dateB;
        case "newest": default: return dateB - dateA;
      }
    });
  }, [data, q, sortBy]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="staff-clients-page">
      <h1 className="font-display text-4xl font-medium">Clients</h1>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-xl">
        <div className="relative w-full sm:w-96 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            data-testid="clients-search" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Search by name or email…" 
            className="vx-input pl-10 pr-10 w-full" 
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ArrowUpDown size={16} className="text-muted-foreground" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="vx-input appearance-none w-full sm:w-48"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Goal</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground animate-pulse">Loading clients...</td></tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-destructive">
                  Failed to load clients. <button onClick={() => mutate()} className="underline font-medium ml-1">Try again</button>
                </td>
              </tr>
            ) : (
              <>
                {filteredAndSorted.map((c: any) => (
                  <tr key={c.member_id} className="text-sm hover:bg-muted/30 transition-colors group">
                    <td className="p-4 font-medium">{c.profiles?.full_name || "—"}</td>
                    <td className="p-4 text-muted-foreground">{c.profiles?.email}</td>
                    <td className="p-4 text-muted-foreground">{c.profiles?.health_goal || "—"}</td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">{formatDate(c.created_at)}</td>
                    <td className="p-4 text-right">
                      <Link href={`/staff/clients/${c.member_id}`} className="text-[var(--vx-ink)] hover:underline opacity-0 group-hover:opacity-100 transition-opacity font-medium text-xs">
                        View Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredAndSorted.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <p className="text-muted-foreground">No matching clients found.</p>
                      {q && (
                        <button onClick={() => setQ("")} className="mt-2 text-sm text-[var(--vx-ink)] hover:underline">
                          Clear search filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
