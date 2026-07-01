import { ShieldCheck } from "lucide-react";

export default function GinaPage() {
 return (
 <article data-testid="legal-gina" className="mx-auto max-w-3xl px-6 py-16">
 <div className="inline-flex items-center gap-2 rounded-full vx-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
 <ShieldCheck size={12} className="text-[var(--vx-jade)]" /> Genetic Privacy
 </div>
 <h1 className="mt-3 font-display text-5xl font-medium tracking-tight">GINA Protection</h1>
 <p className="mt-3 text-muted-foreground">
 The Genetic Information Nondiscrimination Act of 2008 (GINA) protects you from being denied employment or health insurance on the basis of your genetic data. VitalityX honors GINA — fully and unconditionally.
 </p>

 <div className="mt-10 space-y-6 text-[15px] leading-relaxed">
 <Section title="What this means in practice">
 Your uploaded genetic data is never shared with employers, insurers, or marketing partners. Your coach sees clinically actionable summaries (e.g. APOE status, MTHFR variants) — not your raw genome.
 </Section>
 <Section title="How we store it">
 Genetic data is encrypted at rest in Supabase and row-level-secured to your account and your assigned coach only. Operations staff cannot read it.
 </Section>
 <Section title="Your right to revoke">
 You can delete uploaded genetic data at any time from <a href="/member/data" className="underline">My Data</a>. Deletion is immediate and irreversible.
 </Section>
 <Section title="What we use it for">
 Personalization of nutrient response, exercise prescription, sleep chronotype, and risk flags only. We do not use it for pricing or eligibility decisions.
 </Section>
 </div>
 </article>
 );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
 return (
 <section>
 <h2 className="font-display text-2xl font-medium">{title}</h2>
 <p className="mt-2 text-muted-foreground">{children}</p>
 </section>
 );
}
