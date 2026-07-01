import { useState } from "react";
import { format } from "date-fns";

const AVAILABLE_TIMES = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

export function RescheduleModal({
  currentScheduledAt,
  onClose,
  onReschedule,
}: {
  currentScheduledAt: string;
  onClose: () => void;
  onReschedule: (newStart: string, newEnd: string) => Promise<void>;
}) {
  const initialDate = currentScheduledAt ? currentScheduledAt.split("T")[0] : "";
  const initialTime = currentScheduledAt ? currentScheduledAt.split("T")[1]?.substring(0, 5) : "";
  
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const newStart = new Date(`${date}T${time}:00`).toISOString();
    const newEnd = new Date(new Date(newStart).getTime() + 60 * 60 * 1000).toISOString();
    await onReschedule(newStart, newEnd);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="border-b border-white/5 p-6 pb-4 shrink-0">
          <h2 className="font-display text-2xl font-medium">Reschedule Session</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select a new date and time</p>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="mb-4 rounded-xl bg-[var(--vx-jade)]/10 p-3 text-sm text-[var(--vx-jade)]">
            <span className="font-medium block">Current Time:</span>
            {currentScheduledAt && format(new Date(currentScheduledAt), "MMMM d, yyyy h:mm a")}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">New Date</label>
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

          <div className="mt-6 flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="btn btn-ghost" disabled={loading}>Cancel</button>
            <button
              disabled={!date || !time || (date === initialDate && time === initialTime) || loading}
              onClick={handleConfirm}
              className="btn btn-primary"
            >
              {loading ? "Updating..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
