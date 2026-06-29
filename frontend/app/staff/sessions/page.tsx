"use client";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const supabase = createClient();

export default function StaffSessions() {
  const { data: sessions, mutate } = useSWR("staff-sessions", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from("sessions")
      .select("*, member:profiles!sessions_member_id_fkey(full_name)")
      .eq("coach_id", user.id)
      .order("scheduled_at", { ascending: false });
    return data || [];
  });

  async function confirmSession(id: string) {
    const { error } = await supabase
      .from("sessions")
      .update({ status: "confirmed" })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Session confirmed.");
    mutate();
  }

  if (!sessions) return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10" data-testid="staff-sessions-page">
      <h1 className="font-display text-4xl font-medium">All sessions</h1>
      <ul className="mt-6 space-y-2">
        {sessions.map((s: any) => (
          <li key={s.id} className="vx-card flex items-center justify-between p-4 text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{s.member?.full_name || "Unknown Member"}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{formatDateTime(s.scheduled_at)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${
                s.status === "confirmed"
                  ? "badge-jade"
                  : s.status === "cancelled"
                  ? "badge-coral"
                  : "badge-ink"
              }`}>{s.status}</span>
              {s.status === "pending" && (
                <button
                  data-testid={`confirm-session-${s.id}`}
                  onClick={() => confirmSession(s.id)}
                  className="btn btn-primary text-xs px-3 py-1.5"
                >
                  Confirm
                </button>
              )}
            </div>
          </li>
        ))}
        {sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet.</p>}
      </ul>
    </div>
  );
}
