import { useState, useEffect } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const SESSION_TYPES = [
  "Initial Consultation",
  "Protocol Review",
  "Lab Review",
  "Follow-up",
  "Nutrition Consultation",
  "Lifestyle Coaching",
];

const AVAILABLE_TIMES = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

export function BookingModal({
  onClose,
  onBook,
  preselectedCoachId,
}: {
  onClose: () => void;
  onBook: (data: any) => Promise<void>;
  preselectedCoachId?: string | null;
}) {
  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
  const [coachId, setCoachId] = useState(preselectedCoachId || "");
  const [coaches, setCoaches] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCoaches() {
      const { data } = await supabase.from("profiles").select("id, full_name").eq("role", "Coach");
      if (data) setCoaches(data);
      if (!coachId && data && data.length > 0) setCoachId(data[0].id);
    }
    loadCoaches();
  }, [coachId]);

  const handleConfirm = async () => {
    setLoading(true);
    const scheduledStart = new Date(`${date}T${time}:00`).toISOString();
    const scheduledEnd = new Date(new Date(scheduledStart).getTime() + 60 * 60 * 1000).toISOString(); // 1 hour duration
    
    await onBook({
      title: sessionType,
      session_type: sessionType,
      staff_id: coachId,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="border-b border-white/5 p-6 pb-4">
          <h2 className="font-display text-2xl font-medium">Book a Session</h2>
          <p className="mt-1 text-sm text-muted-foreground">Step {step} of 3</p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Session Type</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="vx-input w-full"
                >
                  {SESSION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium">Select Coach</label>
                <select
                  value={coachId}
                  onChange={(e) => setCoachId(e.target.value)}
                  className="vx-input w-full"
                >
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4">
                <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                <button onClick={() => setStep(2)} className="btn btn-primary">Next</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Select Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setTime(""); }}
                  className="vx-input w-full"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              
              {date && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Available Times</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVAILABLE_TIMES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTime(t)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                          time === t
                            ? "border-[var(--vx-jade)] bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]"
                            : "border-white/10 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="btn btn-ghost">Back</button>
                <button
                  disabled={!date || !time}
                  onClick={() => setStep(3)}
                  className="btn btn-primary"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="rounded-xl bg-white/5 p-4 text-sm">
                <div className="grid grid-cols-3 gap-y-3">
                  <span className="text-muted-foreground">Type</span>
                  <span className="col-span-2 font-medium">{sessionType}</span>
                  
                  <span className="text-muted-foreground">Coach</span>
                  <span className="col-span-2 font-medium">{coaches.find(c => c.id === coachId)?.full_name || "Assigned Coach"}</span>
                  
                  <span className="text-muted-foreground">Date</span>
                  <span className="col-span-2 font-medium">{date && format(new Date(date), "MMMM d, yyyy")}</span>
                  
                  <span className="text-muted-foreground">Time</span>
                  <span className="col-span-2 font-medium">{time}</span>
                  
                  <span className="text-muted-foreground">Duration</span>
                  <span className="col-span-2 font-medium">60 minutes</span>
                </div>
              </div>

              <div className="mt-6 flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="btn btn-ghost" disabled={loading}>Back</button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {loading ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
