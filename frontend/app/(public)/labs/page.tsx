import Link from "next/link";
import { Microscope, Activity, Droplets, ArrowRight } from "lucide-react";

export const metadata = {
 title: "Clinical Lab Testing — VitalityX",
 description: "Advanced biomarker diagnostics and cellular aging panels.",
};

export default function LabsPage() {
 return (
 <main className="min-h-screen pt-24 pb-24" data-testid="labs-page">
 <div className="mx-auto max-w-7xl px-6">
 <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
 <div className="order-2 lg:order-1 relative">
 <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border shadow-2xl">
 <img 
 src="/assets/clinical_lab.jpg" 
 alt="Scientist in a clinical laboratory"
 className="h-full w-full object-cover"
 />
 </div>
 </div>
 
 <div className="order-1 lg:order-2">
 <p className="inline-flex items-center gap-2 rounded-full vx-card px-3 py-1 text-xs uppercase tracking-widest text-[var(--vx-jade)] font-medium mb-6">
 <Microscope size={14} /> Diagnostic Offering
 </p>
 <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl lg:text-6xl">
 Measure What <br /><span className="italic">Matters</span>
 </h1>
 <p className="mt-6 text-lg text-muted-foreground">
 We translate raw biological inputs into plain-language clinical insights. By tracking 85+ cardiovascular, metabolic, and hormonal markers, we pinpoint exact longevity optimizations.
 </p>
 
 <div className="mt-10 space-y-6">
 <div className="flex gap-4">
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
 <Droplets size={20} />
 </div>
 <div>
 <h3 className="font-display text-lg font-semibold">Comprehensive Blood Panels</h3>
 <p className="mt-1 text-sm text-muted-foreground">Go far beyond standard physicals. We test for ApoB, hs-CRP, Homocysteine, Fasting Insulin, and comprehensive hormone cascades.</p>
 </div>
 </div>
 <div className="flex gap-4">
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
 <Activity size={20} />
 </div>
 <div>
 <h3 className="font-display text-lg font-semibold">Biological Age Clocks</h3>
 <p className="mt-1 text-sm text-muted-foreground">Monitor the rate at which your cells are aging, and see exactly how your lifestyle interventions are reversing the clock over time.</p>
 </div>
 </div>
 </div>

 <div className="mt-12 flex gap-4">
 <Link href="/programs" className="btn btn-jade">View Programs <ArrowRight size={16} /></Link>
 </div>
 </div>
 </div>
 </div>
 </main>
 );
}
