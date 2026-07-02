"use client";

import useSWR from "swr";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { timeOfDayGreeting, formatDate, getInitials } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Suspense } from "react";
import { ArrowRight, Activity, Droplet, FileText, CheckCircle2, Circle, ChevronRight, Users, Calendar, MessageSquare, FlaskConical, TrendingUp, Sparkles, HeartPulse } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";
import { InteractiveKpiCard } from "@/components/dashboard/InteractiveKpiCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { ModernEmptyState } from "@/components/dashboard/ModernEmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
  const [optimisticCompletions, setOptimisticCompletions] = useState<string[] | null>(null);
  const { data, error, isLoading, mutate } = useSWR("member-dashboard", fetchDashboard, { revalidateOnFocus: false });
  const name = data?.data?.profile?.full_name?.split(" ")[0] ?? "";

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <div className="p-8 text-destructive" data-testid="dashboard-error">Failed to load dashboard: {String(error)}</div>;
  if (!data || !data.user) return null;
  const user = data.user;
  
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
      id: string;
      full_name: string;
      staff_profiles?: {
        profile_photo?: string;
        credentials?: string;
      }[];
    }[];
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

  const d = data.data as DashboardData;
  const team = data.team as TeamMember[];
  const bioHistory = data.bioHistory as BioRecord[];
  const items: { id: string; title: string }[] = d?.protocol_items || [];
  const completedToday: string[] = d?.completions_today || [];
  const activeCompleted = optimisticCompletions || completedToday;
  const doneCount = items.filter((i) => activeCompleted.includes(i.id)).length;
  
  // Biological Age Engine
  const latestBio = bioHistory.length ? bioHistory[bioHistory.length - 1] : null;
  
  const completion7 = items.length ? Math.round((d?.completions_7d || 0) / (items.length * 7) * 100) : 0;

  async function toggle(itemId: string) {
    if (!data || !data.user) return;
    const already = activeCompleted.includes(itemId);

    let newCompleted = [...activeCompleted];
    if (already) {
      newCompleted = newCompleted.filter(id => id !== itemId);
    } else {
      newCompleted.push(itemId);
    }
    
    setOptimisticCompletions(newCompleted);

    try {
      if (already) {
        const { error } = await supabase
          .from("protocol_completions")
          .delete()
          .eq("item_id", itemId)
          .eq("member_id", data.user!.id)
          .gte("completed_at", new Date(new Date().toDateString()).toISOString());
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("protocol_completions")
          .insert({ item_id: itemId, member_id: data.user!.id });
        if (error) throw error;
      }
      
      // Update cache silently
      mutate({
        ...data,
        data: {
          ...data.data,
          completions_today: newCompleted
        }
      }, false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update protocol");
      setOptimisticCompletions(completedToday);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10" data-testid="member-dashboard">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <h1 data-testid="dashboard-greeting" className="font-display text-4xl font-medium tracking-tight">
            {timeOfDayGreeting()}, <span className="text-[var(--vx-jade)]">{name || "there"}</span>.
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">Here's your health & longevity overview.</p>
        </div>
        
        {/* Quick Actions Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/member/sessions" className="btn btn-primary shadow-sm hover:shadow-md transition-shadow">
            <Calendar size={16} /> Book Session
          </Link>
          <Link href="/member/data" className="btn btn-outline bg-card shadow-sm hover:border-[var(--vx-jade)] transition-colors">
            <Activity size={16} /> Log Data
          </Link>
          <Link href="/member/messages" className="btn btn-outline bg-card shadow-sm hover:border-[var(--vx-jade)] transition-colors">
            <MessageSquare size={16} /> Message Team
          </Link>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <InteractiveKpiCard 
          label="Biological age" 
          value={latestBio?.biological_age != null ? `${latestBio.biological_age} yrs` : "—"} 
          href="/member/data"
          icon={<HeartPulse size={20} />}
          trend={latestBio?.chronological_age && latestBio.biological_age ? `${(latestBio.chronological_age - latestBio.biological_age).toFixed(1)} yrs younger` : undefined}
          testId="stat-bio-age" 
        />
        <InteractiveKpiCard 
          label="Longevity score" 
          value={latestBio?.longevity_score != null && String(latestBio.longevity_score) !== "null" ? `${latestBio.longevity_score}` : "—"} 
          href="/member/data"
          icon={<TrendingUp size={20} />}
          trend={latestBio?.longevity_score && latestBio.longevity_score > 85 ? "Optimal Range" : undefined}
          testId="stat-longevity" 
        />
        <InteractiveKpiCard 
          label="7-day completion" 
          value={`${completion7}%`} 
          href="/member/protocol"
          icon={<CheckCircle2 size={20} />}
          trend={completion7 >= 80 ? "On Track" : undefined}
          testId="stat-completion" 
        />
        <InteractiveKpiCard 
          label="Next session" 
          value={d?.next_session ? formatDate(d.next_session.scheduled_start) : "Not booked"} 
          href="/member/sessions"
          icon={<Calendar size={20} />}
          testId="stat-next-session" 
        />
      </div>

      {latestBio && (
        <div className="mt-6 grid gap-4 lg:grid-cols-4 animate-in fade-in duration-500">
          <PremiumCard className="bg-gradient-to-br from-card to-muted/20 border-border/50 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[var(--vx-jade)]/10 flex items-center justify-center text-[var(--vx-jade)] shrink-0">
                <Activity size={14} />
              </div>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Age Diff</p>
            </div>
            {latestBio.biological_age != null && latestBio.chronological_age != null ? (
              <p className={`font-display text-2xl font-medium tracking-tight mt-1 ${latestBio.biological_age < latestBio.chronological_age ? 'text-[var(--vx-jade)]' : 'text-amber-500'}`}>
                {latestBio.biological_age - latestBio.chronological_age > 0 ? '+' : ''}{(latestBio.biological_age - latestBio.chronological_age).toFixed(1)} yrs
              </p>
            ) : (
              <p className="font-display text-2xl font-medium tracking-tight mt-1">—</p>
            )}
          </PremiumCard>
          
          <PremiumCard className="bg-gradient-to-br from-card to-muted/20 border-border/50 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Activity size={14} />
              </div>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Metabolic Risk</p>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <p className="font-display text-2xl font-medium tracking-tight">
                {latestBio.metabolic_score != null && String(latestBio.metabolic_score) !== "null" ? latestBio.metabolic_score : "—"}
              </p>
              {latestBio.metabolic_score != null && <span className="text-muted-foreground text-sm font-medium pb-0.5">/100</span>}
            </div>
          </PremiumCard>
          
          <PremiumCard className="bg-gradient-to-br from-card to-muted/20 border-border/50 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <Activity size={14} />
              </div>
              <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Inflammation Risk</p>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <p className="font-display text-2xl font-medium tracking-tight">
                {latestBio.inflammation_score != null && String(latestBio.inflammation_score) !== "null" ? latestBio.inflammation_score : "—"}
              </p>
              {latestBio.inflammation_score != null && <span className="text-muted-foreground text-sm font-medium pb-0.5">/100</span>}
            </div>
          </PremiumCard>
          
          <PremiumCard className="bg-gradient-to-br from-[var(--vx-jade)]/5 to-[var(--vx-jade)]/10 border-[var(--vx-jade)]/20 p-5 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--vx-jade)]/10 scale-150 mr-4">
              <Sparkles size={64} />
            </div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <div className="w-6 h-6 rounded-full bg-[var(--vx-jade)]/20 flex items-center justify-center text-[var(--vx-jade)] shrink-0">
                <Sparkles size={14} />
              </div>
              <p className="text-xs uppercase text-[var(--vx-ink)] font-semibold tracking-wider">Confidence Score</p>
            </div>
            <p className="font-display text-2xl font-medium tracking-tight mt-1 text-[var(--vx-ink)] relative z-10">
              {latestBio.confidence_score != null && String(latestBio.confidence_score) !== "null" ? `${latestBio.confidence_score}%` : "—"}
            </p>
          </PremiumCard>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Today's protocol */}
        <PremiumCard className="p-0 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--vx-jade)]/10 flex items-center justify-center text-[var(--vx-jade)]">
                <CheckCircle2 size={20} />
              </div>
              <h2 className="font-display text-xl font-medium">Today&apos;s Protocol</h2>
            </div>
            <Link href="/member/protocol" className="text-sm font-medium text-[var(--vx-jade)] hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Daily Progress</span>
                <span className="text-muted-foreground">{doneCount} of {items.length} completed</span>
              </div>
              <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--vx-jade)] to-[var(--vx-emerald,var(--vx-jade))] transition-all duration-1000 ease-out"
                  style={{ width: items.length > 0 ? `${(doneCount / items.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
            
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground/50">
                  <CheckCircle2 size={32} />
                </div>
                <p className="font-medium mb-1">No Protocol Items Yet</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Your coach will publish your protocol after kickoff. Check back soon.
                </p>
              </div>
            ) : (
              <ul className="mt-2 space-y-3">
                {items.map((it) => {
                  const done = activeCompleted.includes(it.id);
                  return (
                    <li key={it.id}>
                      <button 
                        onClick={() => toggle(it.id)} 
                        data-testid={`protocol-toggle-${it.id}`} 
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all group ${
                          done 
                            ? "bg-muted/30 border-transparent opacity-70" 
                            : "bg-card border-border hover:border-[var(--vx-jade)]/50 hover:shadow-sm"
                        }`}
                      >
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                          done 
                            ? "bg-[var(--vx-jade)] text-[var(--vx-ink)]" 
                            : "border-2 border-muted-foreground/30 text-transparent group-hover:border-[var(--vx-jade)]"
                        }`}>
                          {done && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <span className={`flex-1 font-medium transition-all ${done ? "line-through text-muted-foreground" : "text-foreground group-hover:text-[var(--vx-ink)]"}`}>
                          {it.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </PremiumCard>

        {/* Team preview */}
        <PremiumCard className="p-0 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-border/50 bg-muted/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Users size={20} />
                </div>
                <h2 className="font-display text-xl font-medium">My Care Team</h2>
              </div>
            </div>
          </div>
          
          <div className="p-6 flex flex-col flex-1">
            {team.length > 0 ? (
              <div className="space-y-4 flex-1">
                {team.reduce((acc: any[], current: any) => {
                  const staffId = current.staff?.id;
                  if (staffId && !acc.find(item => item.staff?.id === staffId)) {
                    acc.push(current);
                  }
                  return acc;
                }, []).map((assignment: any) => {
                  const staff = assignment.staff;
                  if (!staff) return (
                    <div key={assignment.id} className="flex items-center gap-4 p-3 rounded-xl border border-border/30 bg-muted/10">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground shadow-sm">?</span>
                      <div>
                        <p className="font-medium text-muted-foreground">Unavailable</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{assignment.role}</p>
                      </div>
                    </div>
                  );
                  const profile = staff.staff_profiles?.[0] || {};
                  return (
                    <Link href="/member/team" key={assignment.id} className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-[var(--vx-jade)]/30 hover:bg-muted/10 transition-colors group">
                      <div className="relative">
                        {profile.profile_photo ? (
                          <div className="relative h-12 w-12 rounded-full overflow-hidden shadow-sm">
                            <Image src={profile.profile_photo} alt={staff.full_name} fill className="object-cover" />
                          </div>
                        ) : (
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--vx-jade)]/20 font-medium text-[var(--vx-ink)] shadow-sm">
                            {getInitials(staff.full_name)}
                          </span>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-[var(--vx-ink)] transition-colors">{staff.full_name}</p>
                        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                          {assignment.role} {profile.credentials ? `• ${profile.credentials}` : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground max-w-[200px]">Care team assignment in progress. Your experts will appear here.</p>
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
              <Link href="/member/messages" className="btn btn-outline text-sm w-full justify-center shadow-sm">
                <MessageSquare size={16} className="mr-2" /> Message
              </Link>
              <Link href="/member/sessions" className="btn btn-primary text-sm w-full justify-center shadow-sm">
                <Calendar size={16} className="mr-2" /> Book
              </Link>
            </div>
          </div>
        </PremiumCard>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Bio age trend */}
        <PremiumCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <TrendingUp size={20} />
              </div>
              <h2 className="font-display text-xl font-medium">Biological Age & Longevity Trend</h2>
            </div>
            <Link href="/member/data" className="btn btn-outline text-xs">View Full Details</Link>
          </div>
          
          {bioHistory.length === 0 ? (
            <ModernEmptyState 
              icon={<FlaskConical size={32} />}
              title="Awaiting Data"
              description="Your biological age history will appear here once your initial labs are computed."
            />
          ) : (
            <div className="h-72 w-full mt-4 bg-muted/5 rounded-xl border border-border/30 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bioHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="calculated_at" 
                    stroke="var(--foreground)" 
                    opacity={0.5} 
                    fontSize={11} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="var(--foreground)" 
                    opacity={0.5} 
                    fontSize={11} 
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="var(--foreground)" 
                    opacity={0.5} 
                    fontSize={11} 
                    domain={[0, 100]} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    labelFormatter={(val) => new Date(val).toLocaleString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})} 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  />
                  <Line yAxisId="left" type="monotone" dataKey="biological_age" name="Bio Age" stroke="var(--vx-jade)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--card)' }} activeDot={{ r: 6, fill: 'var(--vx-jade)' }} />
                  <Line yAxisId="right" type="monotone" dataKey="longevity_score" name="Longevity Score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--card)' }} activeDot={{ r: 6, fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </PremiumCard>

        {/* Insights & Recommendations */}
        <PremiumCard className="p-0 overflow-hidden flex flex-col h-full bg-gradient-to-b from-card to-[var(--vx-jade)]/5">
          <div className="p-6 border-b border-border/50 bg-muted/10">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-[var(--vx-jade)]/10 flex items-center justify-center text-[var(--vx-jade)]">
                <Sparkles size={20} />
              </div>
              <h2 className="font-display text-xl font-medium">AI Insights</h2>
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex-1 space-y-4">
              {latestBio ? (
                <>
                  <div className="p-4 bg-card border border-[var(--vx-jade)]/20 shadow-sm rounded-xl relative overflow-hidden group hover:border-[var(--vx-jade)]/40 transition-colors">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--vx-jade)]"></div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <TrendingUp size={16} className="text-[var(--vx-jade)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[15px] group-hover:text-[var(--vx-jade)] transition-colors">Longevity Score is {latestBio.longevity_score != null && String(latestBio.longevity_score) !== "null" ? latestBio.longevity_score : "—"}</p>
                        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">Based on {bioHistory.length} data points. Your confidence score is {latestBio.confidence_score != null && String(latestBio.confidence_score) !== "null" ? <span className="font-medium text-foreground">{latestBio.confidence_score}%</span> : "—"}.</p>
                      </div>
                    </div>
                  </div>
                  
                  {latestBio.biological_age != null && latestBio.chronological_age != null && latestBio.biological_age < latestBio.chronological_age && (
                    <div className="p-4 bg-card border border-blue-500/20 shadow-sm rounded-xl relative overflow-hidden group hover:border-blue-500/40 transition-colors">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <HeartPulse size={16} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-[15px] group-hover:text-blue-500 transition-colors">Excellent Aging Rate</p>
                          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">You are biologically <span className="font-medium text-foreground">{(latestBio.chronological_age - latestBio.biological_age).toFixed(1)} years younger</span> than your calendar age.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {latestBio.recovery_score != null && latestBio.recovery_score < 70 && (
                    <div className="p-4 bg-card border border-amber-500/20 shadow-sm rounded-xl relative overflow-hidden group hover:border-amber-500/40 transition-colors">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Activity size={16} className="text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium text-[15px] group-hover:text-amber-500 transition-colors">Recovery Needs Attention</p>
                          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">Focus on consistent sleep routines to boost your recovery score.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full opacity-60">
                  <Sparkles size={32} className="text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">No Insights Available</p>
                  <p className="text-xs text-muted-foreground mt-1">Log biomarkers and check-ins to generate insights.</p>
                </div>
              )}
            </div>
            
            {latestBio && (
              <div className="mt-6 pt-4 border-t border-border/50">
                <Link href="/member/sessions" className="btn btn-primary w-full justify-center shadow-sm">
                  Book Coaching Session
                </Link>
              </div>
            )}
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="h-12 w-80 animate-pulse rounded-lg bg-muted mb-2" />
          <div className="h-6 w-64 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {Array.from({length:4}).map((_,i) => (
          <div key={i} className="h-[140px] animate-pulse rounded-[24px] bg-muted/50 border border-border/50" />
        ))}
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="h-[400px] lg:col-span-2 animate-pulse rounded-[24px] bg-muted/30 border border-border/50" />
        <div className="h-[400px] animate-pulse rounded-[24px] bg-muted/30 border border-border/50" />
      </div>
    </div>
  );
}
