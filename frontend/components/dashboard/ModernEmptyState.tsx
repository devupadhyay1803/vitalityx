import React from "react";
import Link from "next/link";

interface ModernEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function ModernEmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: ModernEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-[32px] border border-dashed border-border bg-card/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground/50 mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="font-display text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">{description}</p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="btn btn-outline hover:bg-[var(--vx-jade)] hover:text-[var(--vx-ink)] hover:border-[var(--vx-jade)] transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
