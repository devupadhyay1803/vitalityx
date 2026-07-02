import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React from "react";

interface InteractiveKpiCardProps {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  testId?: string;
  className?: string;
}

export function InteractiveKpiCard({ 
  label, 
  value, 
  href, 
  icon, 
  trend, 
  trendPositive = true,
  testId,
  className = "" 
}: InteractiveKpiCardProps) {
  return (
    <Link 
      href={href}
      data-testid={testId}
      className={`group relative flex flex-col rounded-[24px] bg-card border border-border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--vx-jade)] focus:outline-none focus:ring-2 focus:ring-[var(--vx-jade)] focus:ring-offset-2 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-[var(--vx-jade)]/10 group-hover:text-[var(--vx-jade)] transition-colors">
          {icon}
        </div>
        {trend && (
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
            trendPositive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
          }`}>
            {trend}
          </span>
        )}
      </div>
      
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-foreground transition-colors">
        {label}
      </p>
      
      <div className="flex items-end justify-between mt-auto pt-2">
        <p className="font-display text-4xl font-medium tracking-tight text-foreground transition-transform origin-left group-hover:scale-105">
          {value}
        </p>
        <ArrowRight size={18} className="text-muted-foreground/30 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-[var(--vx-jade)]" />
      </div>
    </Link>
  );
}
