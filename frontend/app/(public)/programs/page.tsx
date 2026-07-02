import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { PROGRAMS } from "@/lib/programs";

export const metadata = {
  title: "Programs & Pricing — VitalityX",
  description: "Explore our precision longevity programs and clinical memberships.",
};

export default function ProgramsPage() {
  const list = Object.values(PROGRAMS);

  return (
    <main className="min-h-screen pt-24 pb-32" data-testid="programs-page">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-xs uppercase tracking-widest text-[var(--vx-jade)] font-semibold">Memberships</p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
            Choose Your Health Journey
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Flexible, science-backed health programs designed around your biology and longevity goals.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {list.map((p) => (
            <Link 
              key={p.id}
              href={`/programs/${p.id}`}
              className={`group flex flex-col rounded-[24px] bg-card border overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ${p.popular ? "border-[var(--vx-jade)] shadow-lg ring-1 ring-[var(--vx-jade)]/20" : "border-border shadow-sm"}`}
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                {p.popular && (
                  <span className="absolute top-4 left-4 bg-[var(--vx-jade)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--vx-ink)] rounded-full shadow-md">
                    Most Popular
                  </span>
                )}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-foreground">
                    {p.category}
                  </span>
                  <span className="bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-foreground">
                    {p.duration}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-grow p-8">
                <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground flex-grow leading-relaxed">{p.blurb}</p>
                
                <div className="mt-6 flex items-baseline gap-2 pb-6 border-b border-border/60">
                  <span className="font-display text-4xl tracking-tight text-foreground">${(p.priceCents / 100).toFixed(0)}</span>
                  <span className="text-sm font-medium text-muted-foreground">/ {p.cadence}</span>
                </div>
                
                <div className="mt-6 mb-8 flex flex-wrap gap-2">
                  {p.benefits.slice(0, 3).map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted/40 text-foreground px-2.5 py-1 rounded-md border border-border/50">
                      <Check size={12} className="text-[var(--vx-jade)]" /> {f}
                    </span>
                  ))}
                </div>
                
                <div className="mt-auto">
                  <div className={`flex items-center justify-center gap-2 w-full rounded-full py-3.5 text-center text-sm font-semibold transition ${
                    p.popular 
                      ? "bg-[var(--vx-ink)] text-white group-hover:opacity-90 shadow-md group-hover:shadow-xl" 
                      : "border border-border bg-muted/30 group-hover:bg-muted text-foreground"
                  }`}>
                    View Program <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
