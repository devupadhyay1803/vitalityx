import React from "react";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  timestamp?: string;
  isLast?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  onIconClick?: () => void;
  className?: string;
}

export function TimelineItem({
  icon,
  title,
  description,
  timestamp,
  isLast = false,
  isActive = false,
  onClick,
  onIconClick,
  className
}: TimelineItemProps) {
  return (
    <div 
      className={cn(
        "relative flex gap-4 p-4 rounded-xl transition-colors",
        onClick ? "cursor-pointer hover:bg-muted/50" : "",
        isActive ? "bg-[var(--vx-jade)]/5" : "",
        className
      )}
      onClick={onClick}
    >
      {!isLast && (
        <div className="absolute left-9 top-14 bottom-0 w-px bg-border -ml-px" aria-hidden="true" />
      )}
      
      <div 
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background z-10 transition-colors",
          isActive ? "border-[var(--vx-jade)] text-[var(--vx-jade)]" : "border-border text-muted-foreground",
          (onClick || onIconClick) && !isActive && "group-hover:border-[var(--vx-jade)]/50",
          onIconClick && !isActive && "cursor-pointer hover:border-[var(--vx-jade)] hover:text-[var(--vx-jade)]",
          onIconClick && isActive && "cursor-pointer"
        )}
        onClick={(e) => {
          if (onIconClick) {
            e.stopPropagation();
            onIconClick();
          }
        }}
      >
        {icon}
      </div>
      
      <div className="flex-1 pt-1.5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
          <div className={cn(
            "font-medium text-foreground",
            isActive && "text-[var(--vx-jade)]"
          )}>
            {title}
          </div>
          {timestamp && (
            <time className="text-xs text-muted-foreground whitespace-nowrap">
              {timestamp}
            </time>
          )}
        </div>
        {description && (
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
