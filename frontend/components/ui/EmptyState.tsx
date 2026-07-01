import React from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
 icon: LucideIcon;
 title: string;
 description: string;
 actionLabel?: string;
 actionHref?: string;
 actionOnClick?: () => void;
 className?: string;
}

export function EmptyState({
 icon: Icon,
 title,
 description,
 actionLabel,
 actionHref,
 actionOnClick,
 className = "",
}: EmptyStateProps) {
 return (
 <div className={`flex flex-col items-center justify-center p-8 text-center bg-card rounded-2xl border border-border ${className}`}>
 <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
 <Icon className="w-8 h-8 text-muted-foreground" />
 </div>
 <h3 className="font-display text-lg font-medium text-foreground mb-1">{title}</h3>
 <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
 
 {actionLabel && actionHref && (
 <Link href={actionHref} className="btn btn-primary">
 {actionLabel}
 </Link>
 )}
 
 {actionLabel && actionOnClick && !actionHref && (
 <button onClick={actionOnClick} className="btn btn-primary">
 {actionLabel}
 </button>
 )}
 </div>
 );
}
