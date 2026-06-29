import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
  title: "Programs & Pricing — VitalityX",
  description: "Explore our precision longevity programs and clinical memberships.",
};

const PROGRAMS = [
  {
    name: "Starter Assessment",
    price: "$299",
    cadence: "one-time",
    blurb: "Understand your genetic aging variants and baseline biological pathways.",
    features: ["DNA Methylation Sequencing", "Biological Age Clock", "Methylation pathway risk audit", "Baseline Daily Protocol Blueprint"],
    cta: "Select Program",
    popular: false,
  },
  {
    name: "Complete Longevity",
    price: "$450",
    cadence: "per month",
    blurb: "Biannual blood audits, active stacked compounds, and continuous clinical oversight.",
    features: ["Everything in Starter", "65+ Blood Biomarker Assays", "Monthly protocol stack updates", "1-on-1 consultations with clinicians", "24/7 care team messaging"],
    cta: "Select Program",
    popular: true,
  },
  {
    name: "Executive Health",
    price: "$1,200",
    cadence: "per month",
    blurb: "Elite supervision, quarterly multi-omics panels, and bespoke compound stacks.",
    features: ["Everything in Complete", "Quarterly 85+ blood panel audits", "Full Body MRI (Annual)", "Continuous Glucose Monitor (CGM)", "Priority VIP booking & support"],
    cta: "Select Program",
    popular: false,
  },
];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen pt-24 pb-24" data-testid="programs-page">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-[var(--vx-jade)] font-semibold">Memberships</p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
            Choose Your Health Journey
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Flexible, science-backed health programs designed around your biology and longevity goals.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PROGRAMS.map((p) => (
            <div key={p.name} className={`relative flex flex-col rounded-3xl border p-8 transition hover:shadow-xl ${p.popular ? "border-[var(--vx-jade)] bg-card shadow-lg ring-1 ring-[var(--vx-jade)]/20" : "border-border bg-card shadow-sm"}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--vx-jade)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--vx-ink)] shadow-md">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground flex-grow">{p.blurb}</p>
              
              <div className="mt-6 flex items-baseline gap-2 pb-6 border-b border-border/60">
                <span className="font-display text-4xl tracking-tight text-foreground">{p.price}</span>
                <span className="text-sm font-medium text-muted-foreground">/ {p.cadence}</span>
              </div>
              
              <ul className="mt-6 space-y-4 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-foreground items-start">
                    <Check size={16} className="mt-0.5 shrink-0 text-[var(--vx-jade)] font-bold" />
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto pt-2">
                <Link 
                  href="/signup" 
                  className={`block w-full rounded-full py-3 text-center text-sm font-semibold transition ${
                    p.popular 
                      ? "bg-[var(--vx-ink)] text-white hover:opacity-90 shadow-md hover:shadow-xl" 
                      : "border border-border bg-muted/30 hover:bg-muted text-foreground"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
