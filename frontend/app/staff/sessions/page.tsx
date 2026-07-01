"use client";
import useSWR from "swr";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { RescheduleModal } from "@/components/portal/RescheduleModal";
import { Search, X, Filter } from "lucide-react";

const supabase = createClient();

type FilterOption = "All" | "Today" | "Upcoming" | "Past" | "Cancelled";

export default function StaffSessions() {
 const [rescheduleAppointment, setRescheduleAppointment] = useState<Record<string, any> | null>(null);
 const [q, setQ] = useState("");
 const [filterBy, setFilterBy] = useState<FilterOption>("All");

 const { data: appointments, error, isLoading, mutate } = useSWR("staff-appointments", async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return [];
 
 // As a staff member, fetch all assigned appointments
 const { data, error } = await supabase.from("appointments")
 .select("*, member:profiles!appointments_member_id_fkey(full_name, email)")
 .eq("staff_id", user.id)
 .order("scheduled_start", { ascending: true });
 
 if (error) throw error;
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

 async function reschedule(newStart: string, newEnd: string) {
 if (!rescheduleAppointment) return;
 const { error } = await supabase
 .from("appointments")
 .update({ 
 scheduled_start: newStart,
 scheduled_end: newEnd,
 status: "Rescheduled",
 updated_at: new Date().toISOString() 
 })
 .eq("id", rescheduleAppointment.id);
 
 if (error) {
 toast.error(error.message);
 return;
 }
 
 fetch("/api/appointments", { method: "POST", body: JSON.stringify({ action: "rescheduled", appointmentId: rescheduleAppointment.id }) });
 toast.success("Session rescheduled.");
 setRescheduleAppointment(null);
 mutate();
 }

 const filteredSessions = useMemo(() => {
 return (appointments || []).filter((s: any) => {
 // 1. Search matching
 const matchesSearch = !q || 
 (s.title || "").toLowerCase().includes(q.toLowerCase()) || 
 (s.member?.full_name || "").toLowerCase().includes(q.toLowerCase());
 
 if (!matchesSearch) return false;

 // 2. Filter logic
 const isToday = new Date(s.scheduled_start).toDateString() === new Date().toDateString();
 const isUpcoming = new Date(s.scheduled_start) > new Date() && !isToday;
 const isPast = new Date(s.scheduled_start) < new Date() && !isToday;

 switch(filterBy) {
 case "Today": return isToday && s.status !== "Cancelled";
 case "Upcoming": return isUpcoming && s.status !== "Cancelled";
 case "Past": return isPast && s.status !== "Cancelled";
 case "Cancelled": return s.status === "Cancelled";
 case "All": default: return true;
 }
 });
 }, [appointments, q, filterBy]);

 if (isLoading) return (
 <div className="mx-auto max-w-5xl px-6 py-10">
 <div className="h-10 w-64 bg-muted rounded animate-pulse mb-8"></div>
 <div className="space-y-4">
 <div className="h-32 bg-muted/50 rounded-xl animate-pulse"></div>
 <div className="h-32 bg-muted/50 rounded-xl animate-pulse"></div>
 </div>
 </div>
 );

 if (error) return (
 <div className="mx-auto max-w-5xl px-6 py-10 text-center">
 <p className="text-destructive font-medium">Failed to load appointments.</p>
 <button onClick={() => mutate()} className="mt-4 btn btn-outline text-xs">Try again</button>
 </div>
 );

 if (!appointments) return null;

 return (
 <div className="mx-auto max-w-5xl px-6 py-10" data-testid="staff-sessions-page">
 <h1 className="font-display text-4xl font-medium">Session Management</h1>
 
 <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between vx-card p-4 ">
 <div className="relative w-full sm:w-96 flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
 <input 
 value={q} 
 onChange={(e) => setQ(e.target.value)} 
 placeholder="Search sessions by title or member name…" 
 className="vx-input pl-10 pr-10 w-full" 
 />
 {q && (
 <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
 <X size={16} />
 </button>
 )}
 </div>
 
 <div className="flex items-center gap-2 w-full sm:w-auto">
 <Filter size={16} className="text-muted-foreground" />
 <select 
 value={filterBy} 
 onChange={(e) => setFilterBy(e.target.value as FilterOption)}
 className="vx-input appearance-none w-full sm:w-48"
 >
 <option value="All">All Sessions</option>
 <option value="Today">Today</option>
 <option value="Upcoming">Upcoming</option>
 <option value="Past">Past</option>
 <option value="Cancelled">Cancelled</option>
 </select>
 </div>
 </div>
 
 <div className="mt-8">
 <div className="space-y-4">
 {filteredSessions.length === 0 ? (
 <div className="p-12 text-center border border-dashed border-border rounded-xl">
 <p className="text-muted-foreground">No sessions match your filters.</p>
 {(q || filterBy !== "All") && (
 <button onClick={() => { setQ(""); setFilterBy("All"); }} className="mt-2 text-sm text-[var(--vx-ink)] hover:underline">
 Clear filters
 </button>
 )}
 </div>
 ) : (
 filteredSessions.map((s: Record<string, any>) => (
 <StaffAppointmentCard 
 key={s.id} 
 appointment={s} 
 onUpdateStatus={updateStatus} 
 onUpdateField={updateField} 
 onReschedule={() => setRescheduleAppointment(s)} 
 />
 ))
 )}
 </div>
 </div>
 
 {rescheduleAppointment && (
 <RescheduleModal
 currentScheduledAt={rescheduleAppointment.scheduled_start}
 onClose={() => setRescheduleAppointment(null)}
 onReschedule={reschedule}
 />
 )}
 </div>
 );
}

function StaffAppointmentCard({ appointment, onUpdateStatus, onUpdateField, onReschedule }: { appointment: Record<string, any>, onUpdateStatus: (id: string, s: string) => void, onUpdateField: (id: string, f: string, v: string) => void, onReschedule: () => void }) {
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
 <div className="vx-card p-6">
 <div className="flex flex-col md:flex-row justify-between items-start gap-4">
 <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
 <div className="flex items-center gap-3 mb-1">
 <h3 className="font-display text-lg">{appointment.member?.full_name || "Unknown Member"}</h3>
 <span className={`badge ${
 appointment.status === "Scheduled" ? "badge-ink" :
 appointment.status === "Confirmed" ? "badge-jade" :
 appointment.status === "Rescheduled" ? "badge-amber" :
 appointment.status === "Completed" ? "badge-jade" :
 appointment.status === "No Show" ? "bg-muted text-muted-foreground" :
 "badge-coral"
 }`}>{appointment.status}</span>
 </div>
 <p className="text-sm text-muted-foreground font-medium">{appointment.title}</p>
 <p className="text-sm text-muted-foreground">{formatDateTime(appointment.scheduled_start)}</p>
 </div>

 <div className="flex gap-2 shrink-0">
 {appointment.status === "Scheduled" && (
 <>
 <button onClick={() => onUpdateStatus(appointment.id, "Confirmed")} className="btn btn-primary px-3 text-xs">Confirm</button>
 <button onClick={() => onUpdateStatus(appointment.id, "Cancelled")} className="btn btn-outline px-3 text-xs">Reject</button>
 </>
 )}
 {appointment.status === "Confirmed" && (
 <button onClick={() => onUpdateStatus(appointment.id, "Completed")} className="btn bg-[var(--vx-jade)] text-black hover:bg-[var(--vx-jade)]/90 px-3 text-xs">Mark Complete</button>
 )}
 {(appointment.status === "Confirmed" || appointment.status === "Scheduled" || appointment.status === "Rescheduled") && (
 <button onClick={() => onUpdateStatus(appointment.id, "No Show")} className="btn btn-ghost text-muted-foreground px-3 text-xs">No Show</button>
 )}
 {appointment.status !== "Completed" && appointment.status !== "Cancelled" && appointment.status !== "No Show" && (
 <button onClick={onReschedule} className="btn btn-ghost px-3 text-xs">Reschedule</button>
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
 <button onClick={saveLink} className="btn btn-outline text-xs">Save Link</button>
 {appointment.meeting_link && (
 <a href={appointment.meeting_link} target="_blank" rel="noreferrer" className="btn btn-ghost text-[var(--vx-jade)] h-9 flex items-center">Open</a>
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
