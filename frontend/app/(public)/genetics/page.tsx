import Link from "next/link";
import { Dna, ShieldCheck, FileText, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Genetic Sequencing — VitalityX",
  description: "Decode your DNA to uncover specific genetic variants that influence your health span.",
};

export default function GeneticsPage() {
  return (
    <main className="min-h-screen pt-24 pb-24" data-testid="genetics-page">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-[var(--vx-jade)] font-medium mb-6">
              <Dna size={14} /> Diagnostic Offering
            </p>
            <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl lg:text-6xl">
              Understand Your <br /><span className="italic">Blueprint</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Our clinical-grade Whole Genome and Methylation Sequencing maps out the precise genetic variants affecting your longevity, metabolic risks, and physical performance.
            </p>
            
            <div className="mt-10 space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
                  <Dna size={20} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">Methylation Pathway Analysis</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Identify MTHFR and related variants to perfectly dial in your B-vitamin and methylation support protocols.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">GINA Protected</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Your genetic data is protected under the Genetic Information Nondiscrimination Act. It is strictly isolated and never sold to third parties.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">Actionable Reports</h3>
                  <p className="mt-1 text-sm text-muted-foreground">We don't just dump raw data. Our clinical engine translates your genetics into a tailored compound and supplement stack.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <Link href="/programs" className="btn btn-jade">View Programs <ArrowRight size={16} /></Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border shadow-2xl">
              <img 
                src="/assets/dna_sequencing.jpg" 
                alt="Glowing photorealistic DNA double helix"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
