import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Users, FileText, CheckCircle2, FlaskConical, Stethoscope, ChevronRight } from "lucide-react";

export default async function StaffDashboard() {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 
 if (!user) return null; // Let layout.tsx handle the redirect
 
 const now = new Date();
 const todayDate = new Date(now.toDateString());
 const tomorrowDate = new Date(todayDate.getTime() + 86400000);

 const [{ count: clientCount }, { data: todaysAppointments }, { data: pendingAppointments }, { count: careTeamCount }] = await Promise.all([
 supabase.from("care_team_assignments").select("member_id", { count: "exact", head: true }).eq("staff_id", user!.id).eq("role", "Lead Coach"),
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
 <div className="mx-auto max-w-6xl px-6 py-10" data-testid="staff-dashboard">
 <h1 className="font-display text-4xl font-medium">Overview</h1>
 <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <Stat label="Your clients" value={String(clientCount ?? 0)} testId="stat-clients" />
 <Stat label="Care Team Cases" value={String(careTeamCount ?? 0)} testId="stat-care-team" />
 <Stat label="Today's sessions" value={String(todaysAppointments?.length ?? 0)} testId="stat-today" />
 <Stat label="Pending requests" value={String(pendingAppointments?.length ?? 0)} testId="stat-pending" />
 </div>
 
 <div className="mt-10 grid md:grid-cols-2 gap-8">
 <div>
 <h2 className="font-display text-xl">Today&apos;s schedule</h2>
 {!todaysAppointments?.length ? <p className="mt-3 text-sm text-muted-foreground">Nothing scheduled today.</p> :
 <ul className="mt-4 space-y-3">{todaysAppointments.map((s: Record<string, any>) => (
 <li key={s.id} className="vx-card p-4 text-sm flex justify-between items-center">
 <div>
 <p className="font-medium">{s.member?.full_name || "Unknown Member"}</p>
 <p className="text-muted-foreground text-xs">{s.title}</p>
 </div>
 <div className="text-right">
 <p>{formatDateTime(s.scheduled_start).split(", ")[1]}</p>
 <span className={`text-xs ${
 s.status === 'Confirmed' ? 'text-[var(--vx-jade)]' :
 s.status === 'Completed' ? 'text-[var(--vx-jade)]' :
 s.status === 'Cancelled' ? 'text-destructive' :
 s.status === 'Rescheduled' ? 'text-amber-500' :
 s.status === 'No Show' ? 'text-muted-foreground' :
 'text-muted-foreground'
 }`}>{s.status}</span>
 </div>
 </li>
 ))}</ul>}
 </div>
 
 <div>
 <h2 className="font-display text-xl">Awaiting confirmation</h2>
 {!pendingAppointments?.length ? <p className="mt-3 text-sm text-muted-foreground">No pending requests.</p> :
 <ul className="mt-4 space-y-3">{pendingAppointments.map((s: Record<string, any>) => (
 <li key={s.id} className="vx-card p-4 text-sm flex justify-between items-center">
 <div>
 <p className="font-medium">{s.member?.full_name || "Unknown Member"}</p>
 <p className="text-muted-foreground text-xs">{s.title}</p>
 </div>
 <div className="text-right">
 <p>{formatDateTime(s.scheduled_start).split(",")[0]}</p>
 <a href="/staff/sessions" className="text-xs text-[var(--vx-jade)] hover:underline mt-1 block">Review</a>
 </div>
 </li>
 ))}</ul>}
 </div>
 </div>
 </div>
 );
}
function Stat({ label, value, testId }: { label: string; value: string; testId: string }) {
 return <div data-testid={testId} className="vx-card p-6"><p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl">{value}</p></div>;
}
