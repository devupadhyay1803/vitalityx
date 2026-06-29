"use client";
import useSWR from "swr";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const supabase = createClient();

export default function StaffSessions() {
  const { data: appointments, mutate } = useSWR("staff-appointments", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    // As a staff member, fetch all assigned appointments
    const { data } = await supabase.from("appointments")
      .select("*, member:profiles!appointments_member_id_fkey(full_name, email)")
      .eq("staff_id", user.id)
      .order("scheduled_start", { ascending: true });
      
    return data || [];
  });

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("appointments").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    
    // Trigger notification placeholder
    fetch("/api/appointments", { method: "POST", body: JSON.stringify({ action: status.toLowerCase(), appointmentId: id }) });
    toast.success(`Appointment ${status.toLowerCase()}`);
    mutate();
  }

  async function updateField(id: string, field: string, value: string) {
    const { error } = await supabase.from("appointments").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated successfully");
    mutate();
  }

  if (!appointments) return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;

  const today = appointments.filter((s: any) => new Date(s.scheduled_start).toDateString() === new Date().toDateString());
  const upcoming = appointments.filter((s: any) => new Date(s.scheduled_start) > new Date() && new Date(s.scheduled_start).toDateString() !== new Date().toDateString());

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" data-testid="staff-sessions-page">
      <h1 className="font-display text-4xl font-medium">Session Management</h1>
      
      <div className="mt-8">
        <h2 className="font-display text-xl mb-4">Today's Appointments</h2>
        <div className="space-y-4">
          {today.length === 0 ? <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p> : 
            today.map((s: any) => <StaffAppointmentCard key={s.id} appointment={s} onUpdateStatus={updateStatus} onUpdateField={updateField} />)
          }
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-xl mb-4">Upcoming</h2>
        <div className="space-y-4">
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming appointments.</p> : 
            upcoming.map((s: any) => <StaffAppointmentCard key={s.id} appointment={s} onUpdateStatus={updateStatus} onUpdateField={updateField} />)
          }
        </div>
      </div>
    </div>
  );
}

function StaffAppointmentCard({ appointment, onUpdateStatus, onUpdateField }: any) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(appointment.notes || "");
  const [linkInput, setLinkInput] = useState(appointment.meeting_link || "");
  const [isExpanded, setIsExpanded] = useState(false);

  const saveNotes = () => {
    onUpdateField(appointment.id, "notes", notesInput);
    setEditingNotes(false);
  };

  const saveLink = () => {
    onUpdateField(appointment.id, "meeting_link", linkInput);
  };

  return (
    <div className="vx-card p-5">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-display text-lg">{appointment.member?.full_name || "Unknown Member"}</h3>
            <span className={`badge ${
              appointment.status === "Scheduled" ? "badge-ink" :
              appointment.status === "Confirmed" ? "badge-jade" :
              appointment.status === "Completed" ? "bg-white/10 text-white" : "badge-coral"
            }`}>{appointment.status}</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{appointment.title}</p>
          <p className="text-sm text-muted-foreground">{formatDateTime(appointment.scheduled_start)}</p>
        </div>

        <div className="flex gap-2 shrink-0">
          {appointment.status === "Scheduled" && (
            <>
              <button onClick={() => onUpdateStatus(appointment.id, "Confirmed")} className="btn btn-primary px-3 py-1.5 text-xs">Confirm</button>
              <button onClick={() => onUpdateStatus(appointment.id, "Cancelled")} className="btn btn-outline px-3 py-1.5 text-xs">Reject</button>
            </>
          )}
          {appointment.status === "Confirmed" && (
            <button onClick={() => onUpdateStatus(appointment.id, "Completed")} className="btn bg-[var(--vx-jade)] text-black hover:bg-[var(--vx-jade)]/90 px-3 py-1.5 text-xs">Mark Complete</button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-4 border-t border-white/5 space-y-4 animate-in fade-in">
          <div>
            <label className="text-sm font-medium block mb-1">Meeting Link</label>
            <div className="flex gap-2">
              <input 
                type="url" 
                value={linkInput} 
                onChange={(e) => setLinkInput(e.target.value)} 
                placeholder="https://zoom.us/j/..."
                className="vx-input flex-1 text-sm h-9" 
              />
              <button onClick={saveLink} className="btn btn-outline text-xs px-3">Save Link</button>
              {appointment.meeting_link && (
                 <a href={appointment.meeting_link} target="_blank" rel="noreferrer" className="btn btn-ghost text-[var(--vx-jade)] px-3 h-9 flex items-center">Open</a>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium">Session Notes</label>
              {!editingNotes && <button onClick={() => setEditingNotes(true)} className="text-xs text-[var(--vx-jade)] hover:underline">Edit</button>}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea 
                  value={notesInput} 
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="vx-input w-full min-h-[100px] text-sm"
                  placeholder="Add clinical notes here..."
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setEditingNotes(false); setNotesInput(appointment.notes || ""); }} className="btn btn-ghost text-xs">Cancel</button>
                  <button onClick={saveNotes} className="btn btn-primary text-xs">Save Notes</button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white/5 rounded-lg text-sm text-muted-foreground min-h-[60px] whitespace-pre-wrap">
                {appointment.notes || "No notes yet."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
