import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-[var(--vx-jade)]/20 blur-xl"></div>
        <div className="relative flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-card border border-border/50 shadow-sm">
          <Sparkles className="h-6 w-6 text-[var(--vx-jade)]" />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading...</p>
    </div>
  );
}
