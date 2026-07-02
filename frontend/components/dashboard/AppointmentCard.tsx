import { getInitials, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { MessageSquare, Calendar, ChevronRight, CheckCircle2, Clock } from "lucide-react";

interface AppointmentCardProps {
  id: string;
  clientName: string;
  title: string;
  scheduledStart: string;
  status: string;
  durationMins?: number;
  avatarUrl?: string;
  isPending?: boolean;
}

export function AppointmentCard({
  id,
  clientName,
  title,
  scheduledStart,
  status,
  durationMins = 45,
  avatarUrl,
  isPending = false
}: AppointmentCardProps) {
  
  const statusColors: Record<string, string> = {
    'Confirmed': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Completed': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Scheduled': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Cancelled': 'bg-red-500/10 text-red-600 border-red-500/20',
    'Rescheduled': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'No Show': 'bg-muted text-muted-foreground border-border',
  };

  const statusColor = statusColors[status] || statusColors['Scheduled'];

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[24px] bg-card border border-border shadow-sm hover:shadow-md hover:border-[var(--vx-jade)]/50 transition-all duration-300">
      
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        <div className="w-14 h-14 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={clientName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-medium text-lg text-muted-foreground">{getInitials(clientName || "Unknown")}</span>
          )}
        </div>
        
        <div>
          <h4 className="font-semibold text-lg text-foreground group-hover:text-[var(--vx-jade)] transition-colors">{clientName || "Unknown Member"}</h4>
          <p className="text-sm text-muted-foreground mb-1.5">{title}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded flex items-center gap-1.5">
              <Clock size={12} className="text-[var(--vx-jade)]" /> 
              {isPending ? formatDateTime(scheduledStart).split(",")[0] : formatDateTime(scheduledStart).split(", ")[1]}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusColor}`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-end border-t sm:border-t-0 border-border pt-4 sm:pt-0">
        {isPending ? (
          <>
            <Link href={`/staff/sessions/${id}`} className="btn btn-outline text-xs h-9 hover:bg-[var(--vx-jade)] hover:text-[var(--vx-ink)] transition-colors flex-1 sm:flex-none justify-center">
              Review Request
            </Link>
          </>
        ) : (
          <>
            <Link href={`/staff/messages?client=${clientName}`} className="btn btn-outline text-xs h-9 px-3 flex-1 sm:flex-none justify-center">
              <MessageSquare size={14} /> 
            </Link>
            <Link href={`/staff/sessions/${id}`} className="btn btn-primary text-xs h-9 flex-1 sm:flex-none justify-center">
              View Details <ChevronRight size={14} />
            </Link>
          </>
        )}
      </div>

    </div>
  );
}
