import React from "react";
import { cn } from "@/lib/utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export function PremiumCard({ children, interactive = false, className, ...props }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] bg-card border border-border p-6 shadow-sm transition-all duration-300",
        interactive && "hover:-translate-y-1 hover:shadow-md hover:border-[var(--vx-jade)] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
