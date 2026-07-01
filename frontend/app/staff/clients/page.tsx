"use client";
import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

const supabase = createClient();

export default function ClientsPage() {
  const [q, setQ] = useState("");
  const { data, error, isLoading, mutate } = useSWR("staff-clients", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: assignments, error } = await supabase
      .from("care_team_assignments")
      .select("member_id, created_at, profiles!care_team_assignments_member_id_fkey(id, full_name, email, health_goal)")
      .eq("staff_id", user.id);
    if (error) throw error;
    return assignments || [];
  });

  const filtered = (data || []).filter((c: any) => {
    if (!q) return true;
    const p = c.profiles || {};
    return (p.full_name || "").toLowerCase().includes(q.toLowerCase()) || (p.email || "").toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="staff-clients-page">
      <h1 className="font-display text-4xl font-medium">Clients</h1>
      <input data-testid="clients-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="vx-input mt-6 max-w-md" />
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Goal</th><th className="p-3">Joined</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground animate-pulse">Loading clients...</td></tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-destructive">
                  Failed to load clients. <button onClick={() => mutate()} className="underline text-muted-foreground">Try again</button>
                </td>
              </tr>
            ) : (
              <>
                {filtered.map((c: any) => (
                  <tr key={c.member_id} className="border-t border-border text-sm">
                    <td className="p-3">{c.profiles?.full_name || "—"}</td>
                    <td className="p-3 text-muted-foreground">{c.profiles?.email}</td>
                    <td className="p-3">{c.profiles?.health_goal || "—"}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(c.created_at)}</td>
                    <td className="p-3"><Link href={`/staff/clients/${c.member_id}`} className="text-[var(--vx-ink)] underline">Open →</Link></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">No clients found.</td></tr>}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
