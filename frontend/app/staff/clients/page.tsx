"use client";
import useSWR from "swr";
import Link from "next/link";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Search, X, ArrowUpDown } from "lucide-react";

const supabase = createClient();

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { ModernEmptyState } from "@/components/dashboard/ModernEmptyState";
import { Users as UsersIcon } from "lucide-react";

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Clients</h1>
          <p className="mt-2 text-muted-foreground text-lg">Manage your assigned members and their health journeys.</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative w-full flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            data-testid="clients-search" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Search clients by name or email…" 
            className="w-full bg-muted/30 border border-border/50 rounded-2xl pl-12 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--vx-jade)] focus:border-transparent transition-all shadow-sm" 
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted">
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex items-center w-full sm:w-auto relative">
          <ArrowUpDown size={16} className="absolute left-4 text-muted-foreground" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full sm:w-56 appearance-none bg-muted/30 border border-border/50 rounded-2xl pl-12 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--vx-jade)] transition-all shadow-sm font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted/50 rounded-[24px] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-500/5 border border-red-500/20 rounded-2xl">
          <p className="text-destructive font-medium">Failed to load clients.</p>
          <button onClick={() => mutate()} className="btn btn-outline mt-4">Try again</button>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <ModernEmptyState 
          icon={<UsersIcon size={32} />}
          title={q ? "No matches found" : "No clients assigned"}
          description={q ? `We couldn't find any clients matching "${q}".` : "You don't have any clients assigned to your care team yet."}
          actionLabel={q ? "Clear search" : undefined}
          actionHref={undefined}
          onAction={q ? () => setQ("") : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSorted.map((c: any) => {
            const name = c.profiles?.full_name || "Unknown Member";
            const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
            
            return (
              <Link href={`/staff/clients/${c.member_id}`} key={c.member_id}>
                <PremiumCard interactive className="h-full flex flex-col group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--vx-jade)]/20 to-[var(--vx-ink)]/20 flex items-center justify-center border border-border shrink-0">
                      <span className="font-display font-medium text-lg text-[var(--vx-ink)]">{initials}</span>
                    </div>
                    <div>
                      <h3 className="font-display font-medium text-xl leading-tight mb-1 group-hover:text-[var(--vx-jade)] transition-colors line-clamp-1">{name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{c.profiles?.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border/50 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Joined</span>
                      <span className="font-medium text-foreground">{formatDate(c.created_at)}</span>
                    </div>
                    {c.profiles?.health_goal && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Goal</span>
                        <span className="font-medium text-foreground truncate max-w-[150px] text-right" title={c.profiles.health_goal}>
                          {c.profiles.health_goal}
                        </span>
                      </div>
                    )}
                  </div>
                </PremiumCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
