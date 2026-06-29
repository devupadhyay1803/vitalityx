"use client";
import useSWR from "swr";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const supabase = createClient();

export default function SessionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<any | null>(null);

  const { data, mutate } = useSWR("sessions", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: cr } = await supabase.from("client_records").select("assigned_coach_id").eq("member_id", user.id).single();
    const { data: sessions } = await supabase.from("sessions").select("*").eq("member_id", user.id).order("scheduled_at", { ascending: false });
    return { userId: user.id, coachId: cr?.assigned_coach_id, sessions: sessions || [] };
  });

  if (!data) return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;

  const upcoming = data.sessions.filter((s: any) => new Date(s.scheduled_at) >= new Date());
  const past = data.sessions.filter((s: any) => new Date(s.scheduled_at) < new Date());

  async function book(scheduled_at: string) {
    if (!data?.coachId) return toast.error("Coach not assigned yet.");
    const { error } = await supabase.from("sessions").insert({
      member_id: data.userId,
      coach_id: data.coachId,
      scheduled_at,
      status: "upcoming",
    });
    if (error) return toast.error(error.message);
    toast.success("Session booked.");
    setShowModal(false);
    mutate();
  }

  async function cancelSession(id: string) {
    const { error } = await supabase
      .from("sessions")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Session cancelled.");
    mutate();
  }

  async function reschedule(scheduled_at: string) {
    if (!rescheduleSession) return;
    const { error } = await supabase
      .from("sessions")
      .update({ scheduled_at })
      .eq("id", rescheduleSession.id);
    if (error) return toast.error(error.message);
    toast.success("Session rescheduled.");
    setRescheduleSession(null);
    mutate();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10" data-testid="member-sessions-page">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-medium">Sessions</h1>
        <button data-testid="book-session-btn" onClick={() => setShowModal(true)} className="btn btn-primary">+ Book Session</button>
      </div>

      <h2 className="mt-10 font-display text-xl">Upcoming</h2>
      {upcoming.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No upcoming sessions.</p> :
        <ul className="mt-3 space-y-2">{upcoming.map((s: any) => (
          <li key={s.id} className="vx-card p-4 text-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{formatDateTime(s.scheduled_at)}</p>
                <span className={`badge ${s.status === 'cancelled' ? 'badge-coral' : 'badge-jade'} mt-1`}>{s.status}</span>
              </div>
              {s.status !== 'cancelled' && (
                <div className="flex gap-2">
                  <button
                    data-testid={`reschedule-session-${s.id}`}
                    onClick={() => setRescheduleSession(s)}
                    className="btn btn-outline text-xs px-3 py-1.5"
                  >
                    Reschedule
                  </button>
                  <button
                    data-testid={`cancel-session-${s.id}`}
                    onClick={() => cancelSession(s.id)}
                    className="btn btn-ghost text-xs text-destructive hover:bg-destructive/10 px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}</ul>}

      <h2 className="mt-10 font-display text-xl">Past</h2>
      {past.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No past sessions.</p> :
        <ul className="mt-3 space-y-2">{past.map((s: any) => (
          <li key={s.id} className="vx-card p-4 text-sm"><div className="flex justify-between"><span>{formatDateTime(s.scheduled_at)}</span><span className="badge badge-ink">{s.status}</span></div>{s.notes && <p className="mt-2 text-muted-foreground">{s.notes}</p>}</li>
        ))}</ul>}

      {showModal && <BookModal onClose={() => setShowModal(false)} onBook={book} />}
      {rescheduleSession && (
        <RescheduleModal
          currentScheduledAt={rescheduleSession.scheduled_at}
          onClose={() => setRescheduleSession(null)}
          onReschedule={reschedule}
        />
      )}
    </div>
  );
}

function BookModal({ onClose, onBook }: { onClose: () => void; onBook: (at: string) => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  return (
    <div data-testid="book-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6">
        <h2 className="font-display text-2xl">Book a session</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose date and time. Your coach will confirm via email.</p>
        <div className="mt-5 space-y-3">
          <input data-testid="book-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="vx-input" min={new Date().toISOString().split("T")[0]} />
          <input data-testid="book-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="vx-input" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button data-testid="book-confirm" disabled={!date} onClick={() => onBook(`${date}T${time}:00`)} className="btn btn-primary">Confirm</button>
        </div>
      </div>
    </div>
  );
}

function RescheduleModal({ onClose, onReschedule, currentScheduledAt }: { onClose: () => void; onReschedule: (at: string) => void; currentScheduledAt: string }) {
  const initialDate = currentScheduledAt ? currentScheduledAt.split("T")[0] : "";
  const initialTime = currentScheduledAt ? currentScheduledAt.split("T")[1]?.slice(0, 5) || "10:00" : "10:00";
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  return (
    <div data-testid="reschedule-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6">
        <h2 className="font-display text-2xl">Reschedule session</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a new date and time for your session.</p>
        <div className="mt-5 space-y-3">
          <input data-testid="reschedule-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="vx-input" min={new Date().toISOString().split("T")[0]} />
          <input data-testid="reschedule-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="vx-input" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button data-testid="reschedule-confirm" disabled={!date} onClick={() => onReschedule(`${date}T${time}:00`)} className="btn btn-primary">Confirm</button>
        </div>
      </div>
    </div>
  );
}
