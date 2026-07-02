import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ComingSoon({ title = "Coming Soon", description = "We are currently working hard to bring you this feature. Check back later!", backUrl = "/" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[var(--vx-jade)] blur-[40px] opacity-20 rounded-full"></div>
        <div className="relative h-24 w-24 bg-card border border-border shadow-lg rounded-3xl flex items-center justify-center">
          <Sparkles size={40} className="text-[var(--vx-jade)]" />
        </div>
      </div>
      
      <h1 className="font-display text-4xl font-semibold mb-4 text-foreground">{title}</h1>
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        {description}
      </p>
      
      <Link href={backUrl} className="btn btn-primary flex items-center gap-2">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
}
