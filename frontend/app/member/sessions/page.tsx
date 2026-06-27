"use client";
import useSWR from "swr";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const supabase = createClient();

export default function SessionsPage() {
  const [showModal, setShowModal] = useState(false);
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-10" data-testid="member-sessions-page">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-medium">Sessions</h1>
        <button data-testid="book-session-btn" onClick={() => setShowModal(true)} className="btn btn-primary">+ Book Session</button>
      </div>

      <h2 className="mt-10 font-display text-xl">Upcoming</h2>
      {upcoming.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No upcoming sessions.</p> :
        <ul className="mt-3 space-y-2">{upcoming.map((s: any) => (
          <li key={s.id} className="vx-card p-4 text-sm"><div className="flex justify-between"><span>{formatDateTime(s.scheduled_at)}</span><span className="badge badge-jade">{s.status}</span></div></li>
        ))}</ul>}

      <h2 className="mt-10 font-display text-xl">Past</h2>
      {past.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No past sessions.</p> :
        <ul className="mt-3 space-y-2">{past.map((s: any) => (
          <li key={s.id} className="vx-card p-4 text-sm"><div className="flex justify-between"><span>{formatDateTime(s.scheduled_at)}</span><span className="badge badge-ink">{s.status}</span></div>{s.notes && <p className="mt-2 text-muted-foreground">{s.notes}</p>}</li>
        ))}</ul>}

      {showModal && <BookModal onClose={() => setShowModal(false)} onBook={book} />}
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
