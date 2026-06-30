"use client";

import useSWR from "swr";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { timeOfDayGreeting, formatDate, getInitials } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Suspense } from "react";
import { ArrowRight, Activity, Droplet, FileText, CheckCircle2, Circle, ChevronRight, Users, Calendar, MessageSquare, FlaskConical } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";

const supabase = createClient();

async function fetchDashboard() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, data: null, team: [], bioHistory: [] };
    const { data, error } = await supabase.rpc("get_member_dashboard", { p_member_id: user.id });
    if (error) {
      console.warn("get_member_dashboard RPC error:", error);
    }

    // Fetch Care Team for preview
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

    // Fetch Biological Age Engine Records
    const { data: bioRecords } = await supabase
      .from("biological_age_records")
      .select("*")
      .eq("member_id", user.id)
      .order("calculated_at", { ascending: true });

    const team = teamAssignments || [];
    const bioHistory = bioRecords || [];

    return { user, data, team, bioHistory };
  } catch (err) {
    console.warn("fetchDashboard error caught:", err);
    return { user: null, data: null, team: [], bioHistory: [] };
  }
}

export default function MemberDashboard() {
  const { data, error, isLoading, mutate } = useSWR("member-dashboard", fetchDashboard, { revalidateOnFocus: false });
  const [name, setName] = useState<string>("");
  useEffect(() => { if (data?.data?.profile?.full_name) setName(data.data.profile.full_name.split(" ")[0]); }, [data]);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <div className="p-8 text-destructive" data-testid="dashboard-error">Failed to load dashboard: {String(error)}</div>;
  if (!data || !data.user) return null;

  interface DashboardData {
    profile?: { full_name: string };
    protocol_items?: { id: string; title: string }[];
    completions_today?: string[];
    completions_7d?: number;
    next_session?: { scheduled_start: string };
    coach?: { full_name: string };
  }
  interface TeamMember {
    id: string;
    role: string;
    staff: {
      full_name: string;
      staff_profiles?: { profile_photo?: string; credentials?: string }[];
    };
  }
  interface BioRecord {
    chronological_age: number;
    biological_age: number;
    longevity_score: number;
    metabolic_score: number;
    inflammation_score: number;
    confidence_score: number;
    recovery_score: number;
    calculated_at: string;
  }

  const d = data!.data as DashboardData;
  const team = data!.team as TeamMember[];
  const bioHistory = data!.bioHistory as BioRecord[];
  const items: { id: string; title: string }[] = d?.protocol_items || [];
  const completedToday: string[] = d?.completions_today || [];
  const doneCount = items.filter((i) => completedToday.includes(i.id)).length;
  
  // Biological Age Engine
  const latestBio = bioHistory.length ? bioHistory[bioHistory.length - 1] : null;
  
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
        <StatCard label="Biological age" value={latestBio ? `${latestBio.biological_age} yrs` : "—"} testId="stat-bio-age" />
        <StatCard label="Longevity score" value={latestBio ? `${latestBio.longevity_score}` : "—"} testId="stat-longevity" />
        <StatCard label="7-day completion" value={`${completion7}%`} testId="stat-completion" />
        <StatCard label="Next session" value={d?.next_session ? formatDate(d.next_session.scheduled_start) : "Not booked"} testId="stat-next-session" />
      </div>

      {latestBio && (
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="vx-card p-4 bg-muted/20 border-border/50">
            <p className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Age Diff</p>
            <p className={`font-display text-xl ${latestBio.biological_age < latestBio.chronological_age ? 'text-[var(--vx-jade)]' : 'text-coral-500'}`}>
              {latestBio.biological_age - latestBio.chronological_age > 0 ? '+' : ''}{(latestBio.biological_age - latestBio.chronological_age).toFixed(1)} yrs
            </p>
          </div>
          <div className="vx-card p-4 bg-muted/20 border-border/50">
            <p className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Metabolic Risk</p>
            <p className="font-display text-xl">{latestBio.metabolic_score}/100</p>
          </div>
          <div className="vx-card p-4 bg-muted/20 border-border/50">
            <p className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Inflammation Risk</p>
            <p className="font-display text-xl">{latestBio.inflammation_score}/100</p>
          </div>
          <div className="vx-card p-4 bg-muted/20 border-border/50">
            <p className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Confidence Score</p>
            <p className="font-display text-xl">{latestBio.confidence_score}%</p>
          </div>
        </div>
      )}

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
          <h2 className="font-display text-xl">Biological Age & Longevity Trend</h2>
          {bioHistory.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              <FlaskConical size={24} className="mx-auto mb-3 opacity-50" />
              Your biological age history will appear here once computed.
            </div>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bioHistory}>
                  <XAxis dataKey="calculated_at" stroke="currentColor" fontSize={11} tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                  <YAxis yAxisId="left" stroke="currentColor" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                  <YAxis yAxisId="right" orientation="right" stroke="currentColor" fontSize={11} domain={[0, 100]} />
                  <Tooltip labelFormatter={(val) => new Date(val).toLocaleString()} contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                  <Line yAxisId="left" type="monotone" dataKey="biological_age" name="Bio Age" stroke="var(--vx-jade)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="longevity_score" name="Longevity Score" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Insights & Recommendations */}
        <div data-testid="bio-insights" className="vx-card p-6">
          <h2 className="font-display text-xl">AI Insights</h2>
          <div className="mt-4 space-y-3">
            {latestBio ? (
              <>
                <div className="p-3 bg-[var(--vx-jade)]/10 text-[var(--vx-jade)] border border-[var(--vx-jade)]/20 rounded-lg text-sm">
                  <p className="font-medium">Longevity Score is {latestBio.longevity_score}</p>
                  <p className="opacity-90 text-xs mt-1">Based on {bioHistory.length} data points. Your confidence score is {latestBio.confidence_score}%.</p>
                </div>
                {latestBio.biological_age < latestBio.chronological_age && (
                  <div className="p-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-sm">
                    <p className="font-medium">Excellent Aging Rate</p>
                    <p className="opacity-90 text-xs mt-1">You are biologically { (latestBio.chronological_age - latestBio.biological_age).toFixed(1) } years younger than your calendar age.</p>
                  </div>
                )}
                {latestBio.recovery_score < 70 && (
                  <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-sm">
                    <p className="font-medium">Recovery Needs Attention</p>
                    <p className="opacity-90 text-xs mt-1">Focus on consistent sleep routines to boost your recovery score.</p>
                  </div>
                )}
                <Link href="/member/sessions" className="btn btn-outline w-full mt-2">Book Coaching Session</Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Log biomarkers and check-ins to generate insights.</p>
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
            {team.map((a: TeamMember) => {
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
