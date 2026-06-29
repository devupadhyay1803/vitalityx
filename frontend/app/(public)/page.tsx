import Link from "next/link";
import {
  ShieldCheck, Microscope, Dna, Beaker, FlaskConical, Stethoscope,
  LayoutDashboard, Activity, Lock, KeyRound, Star, Check,
  ArrowRight, Sparkles,
} from "lucide-react";
import { SupplementsSection } from "@/components/public/supplements-section";
import { ContactForm } from "@/components/public/contact-form";

const TRUST = ["Clinician-led", "Science-backed", "Privacy-first", "FDA Registered Labs"];

const FEATURES = [
  { Icon: Dna,           title: "Genetic Analysis",                image: "https://images.unsplash.com/photo-1532187863486-abf9db258b68?auto=format&fit=crop&w=600&q=70", body: "Decode your DNA to uncover specific genetic variants that influence your health span, cognitive aging, and athletic performance." },
  { Icon: Microscope,    title: "Advanced Lab Testing",            body: "Track 65+ critical biomarkers with comprehensive CLIA-certified diagnostics to gain unprecedented visibility into your biology." },
  { Icon: Activity,      title: "Biological Age Tracking",         body: "Monitor the rate at which your cells are aging and see precisely how your lifestyle and clinical protocols reverse the clock over time." },
  { Icon: FlaskConical,  title: "Personalized Supplement Protocols", body: "Receive tailor-made nutritional, nutraceutical, and lifestyle plans engineered specifically for your unique biological baseline." },
  { Icon: Stethoscope,   title: "Dedicated Health Coaches",        body: "Collaborate 1-on-1 with elite clinicians and coaches who actively interpret your data and accelerate your health goals." },
  { Icon: LayoutDashboard, title: "Smart Member Dashboard",        body: "Centralize your health journey. Track daily progress, access clinical reports, manage appointments, and message your care team in one sleek interface." },
];

const STEPS = [
  { n: "1", title: "Book Consultation",                 body: "Start by meeting with our clinical team to discuss your health history, longevity goals, and any specific areas of optimization." },
  { n: "2", title: "Complete Lab Tests & DNA Analysis", body: "We collect comprehensive biometric data through advanced blood panels, DNA methylation sequencing, and wearable integrations." },
  { n: "3", title: "Receive Personalized Health Protocol", body: "Our precision engine analyzes your unique biomarkers to create a bespoke protocol of nutraceuticals, peptides, and lifestyle changes." },
  { n: "4", title: "Track Progress & Optimize Continuously", body: "Your health isn't static. We continuously monitor your biometrics through our dashboard and adapt your protocol as your cellular age improves." },
];

const ADVANTAGES = [
  { title: "Personalized Care",            image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=600&q=70", body: "Every protocol is custom-engineered based on your unique genetic makeup, biomarker levels, and lifestyle goals. We never use one-size-fits-all templates." },
  { title: "Evidence-Based Recommendations", image: "/assets/clinical_lab.jpg",                                                                  body: "Our interventions are strictly backed by peer-reviewed longevity science and clinical trials. No fads, just proven biological optimizations." },
  { title: "Expert Clinical Team",         image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=70", body: "You're paired with elite longevity physicians and performance coaches who actively monitor your progress and refine your protocols." },
  { title: "Continuous Monitoring",        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b0?auto=format&fit=crop&w=600&q=70", body: "Your health is dynamic. We use continuous biometric feedback loops to adjust your stack as your biological age improves." },
  { title: "Data Privacy & Security",      image: "/assets/secure_vault.jpg",                                                                    body: "Your genetic and clinical data is locked behind HIPAA-compliant, enterprise-grade encryption. Your health information is never sold." },
  { title: "Premium Member Experience",    image: "/assets/hero_woman.jpg",                                                                      body: "Enjoy a frictionless healthcare experience. From at-home testing to our elegant mobile dashboard, we've designed every touchpoint for your convenience." },
];

const BIOMARKERS = [
  { name: "Apolipoprotein B (ApoB)",     target: "<80 mg/dL",     value: "72 mg/dL",   status: "Optimal",    tone: "jade"  as const },
  { name: "hs-CRP (Inflammation)",       target: "<1.0 mg/L",     value: "0.8 mg/L",   status: "Optimal",    tone: "jade"  as const },
  { name: "Homocysteine",                target: "<10.0 µmol/L",  value: "14.2 µmol/L",status: "Elevated",   tone: "coral" as const },
  { name: "Vitamin D (25-hydroxy)",      target: "30-50 ng/mL",   value: "31 ng/mL",   status: "Borderline", tone: "amber" as const },
  { name: "HbA1c (Glycation)",           target: "5.4-5.6%",      value: "5.6%",       status: "Borderline", tone: "amber" as const },
];

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

const SECURITY = [
  { Icon: ShieldCheck, title: "HIPAA Compliant",         body: "Your clinical biomarkers and health panel records are encrypted under federal Health Insurance Portability and Accountability Act standards." },
  { Icon: Dna,         title: "GINA Privacy Protection", body: "Your DNA methylome sequencing data is shielded under the Genetic Information Nondiscrimination Act. It cannot be disclosed to employers or insurers." },
  { Icon: Lock,        title: "Role-Based Access Control", body: "Data boundaries are locked down at the database layer. A member only ever views their own metrics; staff access is strictly assigned and controlled." },
  { Icon: KeyRound,    title: "Mandatory Two-Factor Auth", body: "All clinical coaches, relationship leads, and administrators authenticate with a second factor. Idle sessions time out automatically to secure records." },
];

const FAQS = [
  { q: "How long does testing take?",       a: "Initial home saliva swabs and local lab blood draws are processed within 7-10 business days. Once we receive the results, your personalized protocol is generated and reviewed by your clinical team within 48 hours." },
  { q: "How is my DNA protected?",          a: "Your genetic data is shielded under the federal Genetic Information Nondiscrimination Act (GINA), encrypted at rest, and isolated at the database row level. It cannot be disclosed to insurers, employers, or marketing partners." },
  { q: "Can I cancel my membership?",       a: "Yes — pause or cancel at any time from your member portal under Supplements or Settings. Cancellation takes effect at the end of the current billing cycle." },
  { q: "What biomarkers are included?",     a: "Standard membership includes 65+ markers spanning cardiovascular (ApoB, Lp(a), hs-CRP), metabolic (fasting insulin, HbA1c, OGTT), inflammatory, hormonal, micronutrient, and biological-age clocks. Executive tier extends to 85+ markers and quarterly multi-omics." },
  { q: "How are recommendations personalized?", a: "Our precision engine triangulates your DNA, biomarker trends, intake history, and (optionally) wearable data, then your assigned clinician reviews and signs off on every protocol change. Nothing is auto-shipped without human review." },
  { q: "Is there ongoing coaching?",        a: "Yes. Complete and Executive members get 1-on-1 monthly consultations plus 24/7 messaging with their assigned care team between sessions." },
];

export default function LandingPage() {
  return (
    <main data-testid="landing-page">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="grain absolute inset-0 opacity-30" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-32 hidden h-[640px] w-[640px] rounded-full bg-gradient-to-br from-[var(--vx-jade)]/30 to-transparent blur-3xl md:block"
        />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-16 md:pt-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="vx-fade">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--vx-jade)]" /> Premium Precision Health
              </p>
              <h1 className="font-display text-5xl font-medium leading-[1] tracking-tight md:text-6xl lg:text-7xl">
                Decode Your <span className="italic text-[var(--vx-jade)]">Biology</span>.
                <br />
                Optimize Your Life.
              </h1>
              <p className="mt-7 max-w-xl text-lg text-muted-foreground">
                Personalized health programs powered by advanced diagnostics, genetics, expert coaching, and data-driven insights to help you achieve long-term wellness.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/signup" data-testid="hero-get-started" className="btn btn-primary">
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link href="#features" className="btn btn-outline">
                  Explore Features
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                {TRUST.map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={12} className="text-[var(--vx-jade)]" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: hero photo + dashboard preview */}
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-border">
                <img
                  src="/assets/hero_woman.jpg"
                  alt="Healthy athletic young woman smiling confidently"
                  className="h-[560px] w-full object-cover"
                />
              </div>
              {/* Floating Today's Overview card */}
              <div className="absolute -left-4 bottom-12 hidden w-72 rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur md:block vx-fade" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Today&apos;s Overview</p>
                  <span className="flex items-center gap-1 text-[10px] text-[var(--vx-jade)]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--vx-jade)]" /> Live
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Biological Age</p>
                    <p className="font-display text-3xl">32</p>
                    <p className="text-xs text-[var(--vx-jade)]">−5.2 yrs vs. Chronological</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Health Score</p>
                    <p className="font-display text-3xl">89<span className="text-base text-muted-foreground">/100</span></p>
                    <p className="text-xs text-[var(--vx-jade)]">Optimal</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Next Check-In</p>
                  <p className="mt-1 text-sm">Blood Biomarkers · May 28, 2026</p>
                </div>
                <Link href="/login" className="mt-4 block w-full rounded-lg bg-[var(--vx-ink)] py-2 text-center text-xs font-medium text-white hover:opacity-90">
                  View Dashboard →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES ── */}
      <section id="features" className="border-t border-border bg-[var(--vx-cream)]/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Our Core Features</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight md:text-5xl">
            Everything You Need to Optimize Your Health
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A complete ecosystem built around precision medicine, advanced diagnostics, and personalized health optimization.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, body, image }) => (
              <div key={title} className="vx-card overflow-hidden transition hover:shadow-md flex flex-col">
                {image && <img src={image} alt={title} className="h-32 w-full object-cover" loading="lazy" />}
                <div className="p-7 flex-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--vx-jade)]/15 text-[var(--vx-ink)]"><Icon size={20} /></div>
                  <h3 className="mt-5 font-display text-xl">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">How It Works</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight md:text-5xl">
            Your personalized health journey in four simple steps.
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative vx-card p-7">
                <div className="absolute -top-5 left-7 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--vx-ink)] text-white font-display text-lg">{s.n}</div>
                <h3 className="mt-3 font-display text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADVANTAGE ── */}
      <section className="border-t border-border bg-[var(--vx-ink)] py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs uppercase tracking-widest text-white/50">The VitalityX Advantage</p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">Why Choose VitalityX</h2>
          <p className="mt-4 max-w-xl text-white/70">Healthcare built around you — not averages.</p>
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ADVANTAGES.map((a) => (
              <div key={a.title} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.07]">
                <div className="aspect-[16/9] overflow-hidden bg-white/5">
                  <img src={a.image} alt={a.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--vx-jade)]/20 text-[var(--vx-jade)]"><Sparkles size={12} /></span>
                    <h3 className="font-display text-lg">{a.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-white/70">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLINICAL QUALITY / BIOMARKERS ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Clinical Quality</p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">We Measure What Matters</h2>
              <p className="mt-5 text-muted-foreground">
                We translate raw biological inputs into plain-language clinical insights. By analyzing your cellular methylation markers and a comprehensive list of cardiovascular and metabolic indicators, our clinicians can pinpoint exact longevity optimizations.
              </p>
              <ul className="mt-7 space-y-3 text-sm">
                <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[var(--vx-jade)]" /><span><strong>GINA Sequenced:</strong> Complete genetic privacy under Federal Nondiscrimination protection.</span></li>
                <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[var(--vx-jade)]" /><span><strong>ISO 27001 Data Control:</strong> Your records are isolated at the database layer, never sold.</span></li>
                <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[var(--vx-jade)]" /><span><strong>Certified Laboratories:</strong> Assays processed in federally accredited pathology clinics.</span></li>
              </ul>
            </div>

            <div className="vx-card overflow-hidden">
              <img src="/assets/clinical_lab.jpg" alt="State-of-the-art clinical laboratory diagnostic equipment" className="h-48 w-full object-cover" loading="lazy" />
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Blood Biomarker Assay Preview</p>
                <ul className="mt-4 space-y-3">
                  {BIOMARKERS.map((b) => (
                    <li key={b.name} className="border-b border-border/60 pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{b.name}</p>
                        <span className={`badge ${b.tone === "jade" ? "badge-jade" : b.tone === "amber" ? "badge-amber" : "badge-coral"}`}>{b.status}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Target: {b.target}</span>
                        <span className="font-mono">{b.value}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUPPLEMENTS (with images) ── */}
      <SupplementsSection />

      {/* ── PROGRAMS / PRICING ── */}
      <section id="programs" className="border-t border-border bg-[var(--vx-cream)]/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">Programs &amp; Pricing</p>
          <h2 className="mt-3 text-center font-display text-4xl font-medium leading-tight md:text-5xl">Choose Your Health Journey</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">Flexible health programs designed around your goals.</p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {PROGRAMS.map((p) => (
              <div key={p.name} className={`relative rounded-2xl border p-8 transition hover:shadow-lg ${p.popular ? "border-[var(--vx-jade)] bg-card shadow-md" : "border-border bg-card"}`} data-testid={`program-${p.name.toLowerCase().replace(/\s+/g,"-")}`}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--vx-jade)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--vx-ink)]">Most Popular</span>
                )}
                <h3 className="font-display text-2xl">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-4xl">{p.price}</span>
                  <span className="text-sm text-muted-foreground">/ {p.cadence}</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[var(--vx-jade)]" />{f}</li>
                  ))}
                </ul>
                <Link href="/signup" className={`mt-8 block w-full rounded-full py-2.5 text-center text-sm font-medium transition ${p.popular ? "bg-[var(--vx-ink)] text-white hover:opacity-90" : "border border-border hover:bg-muted"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div className="vx-card overflow-hidden">
              <img src="/assets/secure_vault.jpg" alt="Secure biometrically protected data server environment" className="h-80 w-full object-cover" loading="lazy" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Security &amp; Governance</p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">Clinical-Grade Security Architecture</h2>
              <p className="mt-5 text-muted-foreground">
                We handle sensitive genomic and lab diagnostic records. Our platform is engineered to place data security and patient autonomy above all.
              </p>
              <div className="mt-8 space-y-6">
                {SECURITY.map(({ Icon, title, body }) => (
                  <div key={title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--vx-jade)]/15 text-[var(--vx-ink)]"><Icon size={18} /></span>
                    <div>
                      <h3 className="font-display text-lg">{title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-border bg-[var(--vx-cream)]/30 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Support &amp; Knowledge</p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">Frequently Asked Questions</h2>
          <p className="mt-3 text-muted-foreground">Everything you need to know before getting started.</p>

          <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
            {FAQS.map((f, i) => (
              <details key={i} className="group" data-testid={`faq-${i}`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-lg">
                  {f.q}
                  <span className="ml-auto text-muted-foreground transition group-open:rotate-180">⌄</span>
                </summary>
                <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[var(--vx-ink)] py-24 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-white/50">Join The Future of Medicine</p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-6xl">
            Ready to Take Control<br />of Your Health?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Start your personalized precision health journey today. Decode your biology and reverse your aging clock with elite clinical guidance.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="btn btn-jade">Book Consultation <ArrowRight size={16} /></Link>
            <Link href="#programs" className="rounded-full border border-white/20 px-5 py-2.5 text-sm transition hover:bg-white/10">Explore Programs</Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Get In Touch</p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">Contact Our Clinical Team</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">Have questions about our programs or your protocol? We&apos;re here to help.</p>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <ContactForm />
            <div className="space-y-5">
              <h3 className="font-display text-xl">Contact Information</h3>
              <InfoBlock title="Email Support" lines={["care@vitalityx.health"]} />
              <InfoBlock title="Phone"         lines={["+1 (800) 555-0199"]} />
              <InfoBlock title="Office Address" lines={["100 Precision Way, Suite 400", "San Francisco, CA 94105"]} />
              <InfoBlock title="Business Hours" lines={["Mon – Fri: 8:00 AM – 6:00 PM (PST)", "Sat – Sun: Clinical Support Only"]} />
              <p className="text-xs text-muted-foreground">San Francisco HQ</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="vx-card p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p>
      {lines.map((l) => <p key={l} className="mt-1 text-sm">{l}</p>)}
    </div>
  );
}
