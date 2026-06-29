"use client";

import useSWR from "swr";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { timeOfDayGreeting, formatDate, getInitials } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Suspense } from "react";
import { ArrowRight, Activity, Droplet, FileText, CheckCircle2, ChevronRight, Users, Calendar, MessageSquare, FlaskConical } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";

const supabase = createClient();

async function fetchDashboard() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("no user");
  const { data, error } = await supabase.rpc("get_member_dashboard", { p_member_id: user.id });
  if (error) {
    console.error(error);
  }

  // Also fetch Care Team for preview
  const { data: teamAssignments } = await supabase
    .from("care_team_assignments")
    .select(`
      id, role,
      staff:profiles!care_team_assignments_staff_id_fkey(
        id, full_name,
        staff_profiles(profile_photo, credentials)
      )
    `)
    .eq("member_id", user.id)
    .limit(3);

  const team = teamAssignments || [];

  return { user, data, team };
}

export default function MemberDashboard() {
  const { data, error, isLoading, mutate } = useSWR("member-dashboard", fetchDashboard, { revalidateOnFocus: false });
  const [name, setName] = useState<string>("");
  useEffect(() => { if (data?.data?.profile?.full_name) setName(data.data.profile.full_name.split(" ")[0]); }, [data]);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <div className="p-8 text-destructive" data-testid="dashboard-error">Failed to load dashboard: {String(error)}</div>;

  const d = data!.data as any;
  const team = data!.team as any[];
  const items: any[] = d?.protocol_items || [];
  const completedToday: string[] = d?.completions_today || [];
  const doneCount = items.filter((i) => completedToday.includes(i.id)).length;
  const bioAgeTrend = d?.bio_age_trend || [];
  const latestBio = bioAgeTrend.length ? bioAgeTrend[bioAgeTrend.length - 1].biological_age : null;
  const completion7 = items.length ? Math.round((d?.completions_7d || 0) / (items.length * 7) * 100) : 0;

  async function toggle(itemId: string) {
    const already = completedToday.includes(itemId);
    if (already) {
      await supabase
        .from("protocol_completions")
        .delete()
        .eq("item_id", itemId)
        .eq("member_id", data!.user.id)
        .gte("completed_at", new Date(new Date().toDateString()).toISOString());
    } else {
      const { error } = await supabase.from("protocol_completions").insert({ item_id: itemId, member_id: data!.user.id });
      if (error) toast.error(error.message);
    }
    mutate();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="member-dashboard">
      <h1 data-testid="dashboard-greeting" className="font-display text-4xl font-medium tracking-tight">{timeOfDayGreeting()}, {name || "there"}.</h1>
      <p className="mt-2 text-muted-foreground">Here&apos;s today at a glance.</p>

      {/* Stat row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Biological age" value={latestBio !== null ? `${latestBio} yrs` : "—"} testId="stat-bio-age" />
        <StatCard label="Days on protocol" value={String(d?.days_on_protocol ?? 0)} testId="stat-days" />
        <StatCard label="7-day completion" value={`${completion7}%`} testId="stat-completion" />
        <StatCard label="Next session" value={d?.next_session ? formatDate(d.next_session.scheduled_start) : "Not booked"} testId="stat-next-session" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Today's protocol */}
        <div data-testid="todays-protocol" className="vx-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Today&apos;s protocol</h2>
            <span className="text-sm text-muted-foreground">{doneCount} of {items.length} done</span>
          </div>
          {items.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Your coach will publish your protocol after kickoff. Check back soon.
            </p>
          ) : (
            <ul className="mt-5 space-y-2">
              {items.map((it) => {
                const done = completedToday.includes(it.id);
                return (
                  <li key={it.id}>
                    <button onClick={() => toggle(it.id)} data-testid={`protocol-toggle-${it.id}`} className={`flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition hover:bg-muted ${done ? "opacity-60" : ""}`}>
                      {done ? <CheckCircle2 size={18} className="shrink-0 text-[var(--vx-jade)]" /> : <Circle size={18} className="shrink-0 text-muted-foreground" />}
                      <span className={`flex-1 text-sm ${done ? "line-through" : ""}`}>{it.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Team preview */}
        <div data-testid="my-team" className="vx-card p-6">
          <h2 className="font-display text-xl">My team</h2>
          {d?.coach ? (
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--vx-jade)]/20 font-medium">{getInitials(d.coach.full_name)}</span>
              <div>
                <p className="font-medium">{d.coach.full_name}</p>
                <p className="text-xs text-muted-foreground">Lead Coach</p>
              </div>
            </div>
          ) : <p className="mt-4 text-sm text-muted-foreground">Coach assignment in progress.</p>}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link href="/member/messages" className="btn btn-outline text-xs"><MessageSquare size={14} /> Message</Link>
            <Link href="/member/sessions" className="btn btn-jade text-xs"><Calendar size={14} /> Book</Link>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Bio age trend */}
        <div data-testid="bio-age-chart" className="vx-card p-6 lg:col-span-2">
          <h2 className="font-display text-xl">Biological age trend</h2>
          {bioAgeTrend.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              <FlaskConical size={24} className="mx-auto mb-3 opacity-50" />
              Your first lab panel will appear here.
            </div>
          ) : (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bioAgeTrend}>
                  <XAxis dataKey="tested_at" stroke="currentColor" fontSize={11} />
                  <YAxis stroke="currentColor" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="biological_age" stroke="oklch(0.78 0.16 160)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent biomarkers */}
        <div data-testid="recent-biomarkers" className="vx-card p-6">
          <h2 className="font-display text-xl">Recent biomarkers</h2>
          <div className="mt-4 space-y-3">
            {(d?.latest_biomarkers || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No biomarkers logged yet.</p>
            ) : (
              (d.latest_biomarkers as any[]).map((b) => (
                <div key={b.id} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.value} {b.unit}</p>
                  </div>
                  <span className={`badge ${b.status === "optimal" ? "badge-jade" : b.status === "borderline" ? "badge-amber" : "badge-coral"}`}>{b.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Care Team Section */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">My Care Team</h2>
          <Link href="/member/team" className="text-sm font-medium text-[var(--vx-ink)] hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        
        {team.length === 0 ? (
          <div className="vx-card p-6 flex flex-col items-center justify-center text-center border-dashed border-2">
            <Users className="w-8 h-8 text-muted-foreground opacity-50 mb-3" />
            <p className="text-sm text-muted-foreground max-w-xs">Your care team is being assembled and will appear here soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {team.map((a: any) => {
              const staff = a.staff;
              const profile = staff.staff_profiles?.[0] || {};
              return (
                <Link href="/member/team" key={a.id} className="vx-card p-4 flex items-center gap-4 hover:border-[var(--vx-jade)]/30 transition-colors group">
                  <div className="w-12 h-12 rounded-full border-2 border-muted bg-muted overflow-hidden relative shadow-sm shrink-0">
                    {profile.profile_photo ? (
                      <Image src={profile.profile_photo} alt={staff.full_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
                        {staff.full_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-[var(--vx-ink)] transition-colors">
                      {staff.full_name} {profile.credentials ? `, ${profile.credentials}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{a.role}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div data-testid={testId} className="vx-card p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
function DashboardSkeleton() {
  return <div className="mx-auto max-w-6xl px-6 py-10"><div className="h-10 w-64 animate-pulse rounded bg-muted" /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-24 animate-pulse rounded-xl bg-muted"/>)}</div></div>;
}
