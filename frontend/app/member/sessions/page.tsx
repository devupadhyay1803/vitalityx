"use client";
import useSWR from "swr";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { BookingModal } from "@/components/portal/BookingModal";
import { RescheduleModal } from "@/components/portal/RescheduleModal";
import { Video, MapPin, Clock, FileText } from "lucide-react";
import { logClientAudit } from "@/lib/audit-client";
import { format } from "date-fns";

const supabase = createClient();

export default function SessionsPage() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Record<string, any> | null>(null);

  const { data, error, isLoading, mutate } = useSWR("appointments", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: cr } = await supabase.from("client_records").select("assigned_coach_id").eq("member_id", user.id).maybeSingle();
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*, coach:profiles!appointments_staff_id_fkey(full_name)")
      .eq("member_id", user.id)
      .order("scheduled_start", { ascending: true });
    
    if (error) throw error;
    return { userId: user.id, coachId: cr?.assigned_coach_id, appointments: appointments || [] };
  });

  if (isLoading) return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <div className="h-10 w-48 bg-muted rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="space-y-4">
        <div className="h-28 bg-muted/50 rounded-xl animate-pulse"></div>
        <div className="h-28 bg-muted/50 rounded-xl animate-pulse"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-center">
      <p className="text-destructive font-medium">Failed to load sessions.</p>
      <button onClick={() => mutate()} className="mt-4 btn btn-outline text-xs">Try again</button>
    </div>
  );

  if (!data) return null;

  const upcoming = data.appointments.filter((s: Record<string, any>) => 
    new Date(s.scheduled_start) >= new Date() && s.status !== "Cancelled" && s.status !== "Completed" && s.status !== "No Show"
  );
  
  const past = data.appointments.filter((s: Record<string, any>) => 
    new Date(s.scheduled_start) < new Date() || s.status === "Cancelled" || s.status === "Completed" || s.status === "No Show"
  ).sort((a: Record<string, any>, b: Record<string, any>) => new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime());

 async function book(bookingData: Record<string, any>): Promise<void> {
  const { error, data: newApt } = await supabase
    .from("appointments")
    .insert({
      member_id: data!.userId,
      staff_id: bookingData.staff_id,
      title: bookingData.title,
      session_type: bookingData.session_type,
      scheduled_start: bookingData.scheduled_start,
      scheduled_end: bookingData.scheduled_end,
      status: "Scheduled",
    })
    .select()
    .single();

  if (error) {
    toast.error(error.message);
    return;
  }

  await fetch("/api/appointments", {
    method: "POST",
    body: JSON.stringify({
      action: "booked",
      appointmentId: newApt.id,
    }),
  });

  await logClientAudit("Appointment created", {
    resourceType: "appointment",
    resourceId: newApt.id,
    metadata: {
      service: bookingData.session_type,
      scheduled_at: bookingData.scheduled_start,
      staff_id: bookingData.staff_id,
    },
  });

  toast.success("Session booked successfully.");
  setShowBookingModal(false);
  mutate();
}

  async function cancelAppointment(id: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "Cancelled", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    
    fetch("/api/appointments", { method: "POST", body: JSON.stringify({ action: "cancelled", appointmentId: id }) });
    
    await logClientAudit("Appointment cancelled", {
      resourceType: "appointment",
      resourceId: id
    });

    toast.success("Session cancelled.");
    mutate();
  }

  async function reschedule(
  newStart: string,
  newEnd: string
): Promise<void> {
  if (!rescheduleAppointment) return;

  const { error } = await supabase
    .from("appointments")
    .update({
      scheduled_start: newStart,
      scheduled_end: newEnd,
      status: "Rescheduled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", rescheduleAppointment.id);

  if (error) {
    toast.error(error.message);
    return;
  }

  await fetch("/api/appointments", {
    method: "POST",
    body: JSON.stringify({
      action: "rescheduled",
      appointmentId: rescheduleAppointment.id,
    }),
  });

  await logClientAudit("Appointment rescheduled", {
    resourceType: "appointment",
    resourceId: rescheduleAppointment.id,
    metadata: {
      new_scheduled_at: newStart,
    },
  });

  toast.success("Session rescheduled.");
  setRescheduleAppointment(null);
  mutate();
}

  return (
    <div className="mx-auto max-w-4xl px-6 py-10" data-testid="member-sessions-page">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-medium">Sessions</h1>
        <button onClick={() => setShowBookingModal(true)} className="btn btn-primary">+ Book Session</button>
      </div>

      <h2 className="mt-10 font-display text-xl">Upcoming</h2>
      {upcoming.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No upcoming sessions. Book one to stay on track.</p> :
        <div className="mt-4 grid gap-4">{upcoming.map((s: Record<string, any>) => (
          <AppointmentCard 
            key={s.id} 
            appointment={s} 
            onReschedule={() => setRescheduleAppointment(s)} 
            onCancel={() => cancelAppointment(s.id)}
          />
        ))}</div>
      }

      <h2 className="mt-12 font-display text-xl">Past & Cancelled</h2>
      {past.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No past sessions.</p> :
        <div className="mt-4 grid gap-4 opacity-75">{past.map((s: Record<string, any>) => (
          <AppointmentCard key={s.id} appointment={s} readOnly />
        ))}</div>
      }

      {showBookingModal && (
        <BookingModal 
          preselectedCoachId={data.coachId}
          onClose={() => setShowBookingModal(false)} 
          onBook={book} 
        />
      )}
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

function AppointmentCard({ appointment, onReschedule, onCancel, readOnly }: { appointment: Record<string, any>, onReschedule?: () => void, onCancel?: () => void, readOnly?: boolean }) {
  const isPast = new Date(appointment.scheduled_start) < new Date();
  
  return (
    <div className="vx-card p-5">
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-display text-lg">{appointment.title}</h3>
            <span className={`badge ${
              appointment.status === 'Cancelled'    ? 'badge-coral' : 
              appointment.status === 'Confirmed'    ? 'badge-jade' : 
              appointment.status === 'Completed'    ? 'badge-jade' :
              appointment.status === 'Rescheduled'  ? 'badge-amber' :
              appointment.status === 'No Show'      ? 'bg-muted text-muted-foreground' :
              'badge-ink'
            }`}>{appointment.status}</span>
          </div>
          
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{format(new Date(appointment.scheduled_start), "MMM d, yyyy")} • {format(new Date(appointment.scheduled_start), "h:mm a")}</span>
            </div>
            
            {appointment.coach && (
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span>Coach: {appointment.coach.full_name}</span>
              </div>
            )}
            
            {appointment.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{appointment.location}</span>
              </div>
            )}
          </div>
        </div>
        
        {!readOnly && (
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {appointment.meeting_link && !isPast && appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && appointment.status !== 'No Show' && (
              <a href={appointment.meeting_link} target="_blank" rel="noreferrer" className="btn bg-[var(--vx-jade)] text-black hover:bg-[var(--vx-jade)]/90 px-4 py-2 text-sm flex items-center justify-center gap-2">
                <Video size={16} /> Join
              </a>
            )}
            
            <div className="flex gap-2">
              <button onClick={onReschedule} className="btn btn-outline px-3 py-2 text-sm flex-1 sm:flex-none">Reschedule</button>
              <button onClick={onCancel} className="btn btn-ghost text-destructive hover:bg-destructive/10 px-3 py-2 text-sm flex-1 sm:flex-none">Cancel</button>
            </div>
          </div>
        )}
        
        {readOnly && appointment.status !== 'Cancelled' && appointment.notes && (
          <div className="w-full mt-2 rounded-lg bg-white/5 p-3 text-sm">
            <span className="font-medium text-foreground block mb-1">Coach Notes:</span>
            {appointment.notes}
          </div>
        )}
      </div>
    </div>
  );
}
