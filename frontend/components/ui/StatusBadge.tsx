import React from "react";
import { cn } from "@/lib/utils";

export type StatusType = 
  | "success" 
  | "warning" 
  | "danger" 
  | "info" 
  | "neutral"
  // Specific mappings for ease of use
  | "Confirmed" | "Completed"
  | "Pending" | "Scheduled" | "Rescheduled"
  | "Cancelled" | "No Show" | "Abnormal";

interface StatusBadgeProps {
  status: StatusType;
  label?: string; // Optional override for the text displayed
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const statusColors: Record<StatusType, string> = {
    // Generic
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    danger: "bg-red-500/10 text-red-600 border-red-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    neutral: "bg-muted text-muted-foreground border-border",
    
    // Domain specific
    Confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
    Completed: "bg-green-500/10 text-green-600 border-green-500/20",
    Scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Rescheduled: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
    Abnormal: "bg-red-500/10 text-red-600 border-red-500/20",
    "No Show": "bg-muted text-muted-foreground border-border",
  };

  const colorClass = statusColors[status] || statusColors.neutral;

  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
        colorClass,
        className
      )}
    >
      {label || status}
    </span>
  );
}
