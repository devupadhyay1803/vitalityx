import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export default async function StaffDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const [{ count: clientCount }, { data: todaysAppointments }, { data: pendingAppointments }] = await Promise.all([
    supabase.from("client_records").select("*", { count: "exact", head: true }).eq("assigned_coach_id", user!.id),
    supabase.from("appointments").select("*, member:profiles!appointments_member_id_fkey(full_name)")
      .eq("staff_id", user!.id)
      .gte("scheduled_start", new Date(new Date().toDateString()).toISOString())
      .lt("scheduled_start", new Date(Date.now() + 86400000).toISOString())
      .order("scheduled_start"),
    supabase.from("appointments").select("*, member:profiles!appointments_member_id_fkey(full_name)")
      .eq("staff_id", user!.id)
      .eq("status", "Scheduled")
      .order("scheduled_start")
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="staff-dashboard">
      <h1 className="font-display text-4xl font-medium">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Your clients" value={String(clientCount ?? 0)} testId="stat-clients" />
        <Stat label="Today's sessions" value={String(todaysAppointments?.length || 0)} testId="stat-today" />
        <Stat label="Pending confirmations" value={String(pendingAppointments?.length || 0)} testId="stat-pending" />
      </div>
      
      <div className="mt-10 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-xl">Today&apos;s schedule</h2>
          {!todaysAppointments?.length ? <p className="mt-3 text-sm text-muted-foreground">Nothing scheduled today.</p> :
            <ul className="mt-4 space-y-3">{todaysAppointments.map((s: any) => (
              <li key={s.id} className="vx-card p-4 text-sm flex justify-between items-center">
                <div>
                  <p className="font-medium">{s.member?.full_name || "Unknown Member"}</p>
                  <p className="text-muted-foreground text-xs">{s.title}</p>
                </div>
                <div className="text-right">
                  <p>{formatDateTime(s.scheduled_start).split(", ")[1]}</p>
                  <span className={`text-xs ${s.status === 'Confirmed' ? 'text-[var(--vx-jade)]' : 'text-muted-foreground'}`}>{s.status}</span>
                </div>
              </li>
            ))}</ul>}
        </div>
        
        <div>
          <h2 className="font-display text-xl">Awaiting confirmation</h2>
          {!pendingAppointments?.length ? <p className="mt-3 text-sm text-muted-foreground">No pending requests.</p> :
            <ul className="mt-4 space-y-3">{pendingAppointments.map((s: any) => (
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
  return <div data-testid={testId} className="vx-card p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl">{value}</p></div>;
}
