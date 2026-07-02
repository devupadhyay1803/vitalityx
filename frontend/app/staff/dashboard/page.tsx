import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Users, FileText, CheckCircle2, ShieldAlert, Calendar, MessageSquare, Plus, Activity, Inbox, ChevronRight } from "lucide-react";
import { InteractiveKpiCard } from "@/components/dashboard/InteractiveKpiCard";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import { ModernEmptyState } from "@/components/dashboard/ModernEmptyState";
import { PremiumCard } from "@/components/ui/PremiumCard";

export default async function StaffDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const now = new Date();
  const todayDate = new Date(now.toDateString());
  const tomorrowDate = new Date(todayDate.getTime() + 86400000);

  const [{ count: clientCount }, { data: todaysAppointments }, { data: pendingAppointments }, { count: careTeamCount }] = await Promise.all([
    supabase.from("care_team_assignments").select("member_id", { count: "exact", head: true }).eq("staff_id", user!.id).eq("role", "Health Coach"),
    supabase.from("appointments").select("*, member:profiles!appointments_member_id_fkey(full_name)")
      .eq("staff_id", user!.id)
      .gte("scheduled_start", todayDate.toISOString())
      .lt("scheduled_start", tomorrowDate.toISOString())
      .order("scheduled_start"),
    supabase.from("appointments").select("*, member:profiles!appointments_member_id_fkey(full_name)")
      .eq("staff_id", user!.id)
      .eq("status", "Scheduled")
      .order("scheduled_start"),
    supabase.from("care_team_assignments").select("member_id", { count: "exact", head: true }).eq("staff_id", user!.id)
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10" data-testid="staff-dashboard">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Command Center</h1>
          <p className="mt-2 text-muted-foreground text-lg">Your clinical overview and daily schedule.</p>
        </div>
        
        {/* Quick Actions Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/staff/clients" className="btn btn-primary shadow-sm hover:shadow-md transition-shadow">
            <Plus size={16} /> Add Client
          </Link>
          <Link href="/staff/sessions" className="btn btn-outline bg-card shadow-sm hover:border-[var(--vx-jade)] transition-colors">
            <Calendar size={16} /> Schedule
          </Link>
          <Link href="/staff/messages" className="btn btn-outline bg-card shadow-sm hover:border-[var(--vx-jade)] transition-colors">
            <MessageSquare size={16} /> Message
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <InteractiveKpiCard 
          label="Your Clients" 
          value={String(clientCount ?? 0)} 
          href="/staff/clients" 
          icon={<Users size={20} />} 
          trend="+3 this week" 
          testId="stat-clients" 
        />
        <InteractiveKpiCard 
          label="Care Team Cases" 
          value={String(careTeamCount ?? 0)} 
          href="/staff/care-team" 
          icon={<Activity size={20} />} 
          trend="+1 since yesterday" 
          testId="stat-care-team" 
        />
        <InteractiveKpiCard 
          label="Today's Sessions" 
          value={String(todaysAppointments?.length ?? 0)} 
          href="/staff/sessions?filter=today" 
          icon={<CheckCircle2 size={20} />} 
          testId="stat-today" 
        />
        <InteractiveKpiCard 
          label="Pending Requests" 
          value={String(pendingAppointments?.length ?? 0)} 
          href="/staff/sessions?filter=pending" 
          icon={<ShieldAlert size={20} />} 
          trend={pendingAppointments?.length ? "Action Required" : "All Clear"}
          trendPositive={!pendingAppointments?.length}
          testId="stat-pending" 
        />
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <PremiumCard className="p-0 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--vx-jade)]/10 flex items-center justify-center text-[var(--vx-jade)]">
                <Calendar size={20} />
              </div>
              <h2 className="font-display text-xl font-medium">Today's Schedule</h2>
            </div>
            <Link href="/staff/sessions" className="text-sm font-medium text-[var(--vx-jade)] hover:underline flex items-center gap-1">
              View Calendar <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-card to-muted/5">
            {!todaysAppointments?.length ? (
              <div className="flex-1 flex items-center justify-center">
                <ModernEmptyState 
                  icon={<Calendar size={32} />}
                  title="You're all caught up"
                  description="There are no sessions scheduled for today."
                  actionLabel="View Full Calendar"
                  actionHref="/staff/sessions"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {todaysAppointments.map((s: Record<string, any>) => (
                  <AppointmentCard
                    key={s.id}
                    id={s.id}
                    clientName={s.member?.full_name}
                    title={s.title}
                    scheduledStart={s.scheduled_start}
                    status={s.status}
                  />
                ))}
              </div>
            )}
          </div>
        </PremiumCard>
        
        {/* Awaiting Confirmation */}
        <PremiumCard className="p-0 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Inbox size={20} />
              </div>
              <h2 className="font-display text-xl font-medium">Awaiting Confirmation</h2>
            </div>
            <Link href="/staff/sessions?filter=pending" className="text-sm font-medium text-[var(--vx-jade)] hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-card to-amber-500/5">
            {!pendingAppointments?.length ? (
              <div className="flex-1 flex items-center justify-center">
                <ModernEmptyState 
                  icon={<CheckCircle2 size={32} />}
                  title="Inbox Zero"
                  description="No pending session requests require your approval right now."
                />
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAppointments.map((s: Record<string, any>) => (
                  <AppointmentCard
                    key={s.id}
                    id={s.id}
                    clientName={s.member?.full_name}
                    title={s.title}
                    scheduledStart={s.scheduled_start}
                    status={s.status}
                    isPending={true}
                  />
                ))}
              </div>
            )}
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}
