import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function StaffSessions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: sessions } = await supabase.from("sessions")
    .select("*, member:profiles!sessions_member_id_fkey(full_name)")
    .eq("coach_id", user!.id).order("scheduled_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10" data-testid="staff-sessions-page">
      <h1 className="font-display text-4xl font-medium">All sessions</h1>
      <ul className="mt-6 space-y-2">
        {sessions?.map((s: any) => (
          <li key={s.id} className="vx-card flex items-center justify-between p-4 text-sm">
            <span>{s.member?.full_name}</span><span>{formatDate(s.scheduled_at)}</span><span className="badge badge-ink">{s.status}</span>
          </li>
        ))}
        {!sessions?.length && <p className="text-sm text-muted-foreground">No sessions yet.</p>}
      </ul>
    </div>
  );
}
