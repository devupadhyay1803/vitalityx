import Link from "next/link";
import { Activity, Dna, Beaker, Sparkles, ArrowUpRight } from "lucide-react";
import { SupplementsSection } from "@/components/public/supplements-section";

export default function LandingPage() {
  return (
    <main data-testid="landing-page">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="grain absolute inset-0 opacity-40" />
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-32">
          <div className="grid items-end gap-12 md:grid-cols-12">
            <div className="md:col-span-7 vx-fade">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--vx-jade)]" /> Precision longevity, measured
              </p>
              <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-tight md:text-7xl">
                Make your<br />
                <span className="italic text-[var(--vx-jade)]">biological</span> years<br />
                younger than your<br />
                calendar years.
              </h1>
              <p className="mt-7 max-w-xl text-lg text-muted-foreground">
                VitalityX pairs deep biomarker testing, genetic context, and one assigned human coach
                to compound small, measurable wins into a meaningfully longer healthspan.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/signup" data-testid="hero-get-started" className="btn btn-primary">
                  Start your assessment <ArrowUpRight size={16} />
                </Link>
                <Link href="#protocols" className="btn btn-outline">
                  See the protocol
                </Link>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="vx-card relative overflow-hidden p-6 vx-fade" style={{ animationDelay: "0.15s" }}>
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--vx-jade)] opacity-20 blur-3xl" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">A live member snapshot</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-medium">−4.2</span>
                  <span className="text-sm text-muted-foreground">yrs vs. chronological</span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { label: "ApoB", val: "76 mg/dL", tone: "jade", note: "optimal" },
                    { label: "HRV (7-day)", val: "62 ms", tone: "jade", note: "up 18%" },
                    { label: "Fasting glucose", val: "92 mg/dL", tone: "amber", note: "watch" },
                    { label: "VO₂max", val: "48", tone: "jade", note: "top decile" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                      <span className="text-sm text-muted-foreground">{m.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-sm">{m.val}</span>
                        <span className={`badge ${m.tone === "jade" ? "badge-jade" : "badge-amber"}`}>{m.note}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Science ── */}
      <section id="science" className="border-t border-border bg-[var(--vx-cream)]/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">The Science</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight md:text-5xl">
            We don&apos;t guess. We measure, then we move.
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { Icon: Beaker, title: "Comprehensive labs", body: "Quarterly panels: ApoB, hs-CRP, insulin, sex hormones, omega index, full thyroid, and biological age clocks." },
              { Icon: Dna,    title: "Genetic context",  body: "We layer your SNP profile under GINA protection to personalize nutrient response, sleep chronotype, and risk." },
              { Icon: Activity, title: "Daily signal",  body: "Continuous glucose, HRV, sleep — we use the data you already collect and only adjust when the trend, not the noise, warrants it." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="vx-card p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--vx-jade)]/20 text-[var(--vx-ink)]"><Icon size={18} /></div>
                <h3 className="mt-5 font-display text-xl">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Protocols ── */}
      <section id="protocols" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-end gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Protocols</p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
                Your plan is yours. Your coach is yours.
              </h2>
            </div>
            <p className="text-muted-foreground">
              Every member is assigned one coach who builds the protocol with you and revisits it every six weeks against fresh data.
              No content drips, no group calls — just one accountable human and your numbers.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              { tag: "Longevity", lines: ["Rapamycin candidacy review", "Strength × VO₂ target", "Glycemic control"] },
              { tag: "Performance", lines: ["Zone 2 + intervals", "Recovery prescription", "Creatine + electrolytes"] },
              { tag: "Weight", lines: ["GLP-1 candidacy review", "Protein floor & timing", "Continuous glucose"] },
              { tag: "Cognitive", lines: ["Sleep architecture", "Omega-3 index ≥ 8%", "Lion's mane stack"] },
            ].map((p, i) => (
              <div key={p.tag} className="vx-card p-6 vx-fade" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="badge badge-ink">{p.tag}</span>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {p.lines.map((l) => (<li key={l} className="flex gap-2"><Sparkles size={14} className="mt-0.5 shrink-0 text-[var(--vx-jade)]" />{l}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SupplementsSection />

      {/* ── (old teaser section disabled) ── */}
      <section id="supplements-legacy" className="hidden border-t border-border bg-[var(--vx-ink)] py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-end gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50">The stack</p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
                A short, evidence-led list.<br />
                No fairy dust.
              </h2>
            </div>
            <p className="text-white/70">
              We don&apos;t sell forty SKUs. The stack is small, the dosing is what the trials used, and it changes when your labs change.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { name: "Omega-3 Concentrate", dose: "2.4g EPA+DHA", price: "$44/mo" },
              { name: "Creatine Monohydrate", dose: "5g daily", price: "$18/mo" },
              { name: "Vitamin D3 + K2", dose: "Personalized", price: "$22/mo" },
            ].map((s) => (
              <div key={s.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg">{s.name}</span>
                  <span className="text-sm text-white/60">{s.price}</span>
                </div>
                <p className="mt-1 text-sm text-white/50">{s.dose}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/signup" className="btn btn-jade">Build my stack <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
