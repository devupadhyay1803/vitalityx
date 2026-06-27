import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function StaffDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ count: clientCount }, { data: todaysSessions }] = await Promise.all([
    supabase.from("client_records").select("*", { count: "exact", head: true }).eq("assigned_coach_id", user!.id),
    supabase.from("sessions").select("*, profiles!sessions_member_id_fkey(full_name)").eq("coach_id", user!.id)
      .gte("scheduled_at", new Date(new Date().toDateString()).toISOString())
      .lt("scheduled_at", new Date(Date.now() + 86400000).toISOString())
      .order("scheduled_at"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="staff-dashboard">
      <h1 className="font-display text-4xl font-medium">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Your clients" value={String(clientCount ?? 0)} testId="stat-clients" />
        <Stat label="Today's sessions" value={String(todaysSessions?.length || 0)} testId="stat-today" />
        <Stat label="Avg adherence" value="—" testId="stat-adherence" />
      </div>
      <h2 className="mt-10 font-display text-xl">Today&apos;s sessions</h2>
      {!todaysSessions?.length ? <p className="mt-3 text-sm text-muted-foreground">Nothing scheduled today.</p> :
        <ul className="mt-3 space-y-2">{todaysSessions.map((s: any) => (
          <li key={s.id} className="vx-card p-4 text-sm flex justify-between">
            <span>{s.profiles?.full_name || "Member"}</span><span>{formatDate(s.scheduled_at)}</span>
          </li>
        ))}</ul>}
    </div>
  );
}
function Stat({ label, value, testId }: { label: string; value: string; testId: string }) {
  return <div data-testid={testId} className="vx-card p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl">{value}</p></div>;
}
