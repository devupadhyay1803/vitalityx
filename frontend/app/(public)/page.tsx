import Link from "next/link";
import {
  ShieldCheck, Microscope, Dna, Beaker, FlaskConical, Stethoscope,
  LayoutDashboard, Activity, Lock, KeyRound, Star, Check,
  ArrowRight, Sparkles, AlertCircle, ChevronRight, HelpCircle
} from "lucide-react";
import { SupplementsSection } from "@/components/public/supplements-section";
import { ContactForm } from "@/components/public/contact-form";

const TRUST_LIST = ["Clinician-led", "Science-backed", "Privacy-first", "FDA Registered Labs"];

const TRUST_CARDS = [
  { title: "Clinical Experts", description: "Bespoke medical guidance overseen by elite longevity physicians and coaches.", Icon: Stethoscope },
  { title: "AI Powered", description: "Precision algorithms cross-referencing your genetics against biological datasets.", Icon: Sparkles },
  { title: "Secure Data", description: "Your multi-omics data is protected by HIPAA compliance and isolated DB rules.", Icon: ShieldCheck },
  { title: "Personalized Plans", description: "Protocols custom-compounded and formulated strictly for your genetic makeup.", Icon: Dna }
];

const FEATURES = [
  { Icon: Dna, title: "Genetic Analysis", body: "Decode your DNA to uncover specific genetic variants that influence your health span, cognitive aging, and athletic performance." },
  { Icon: Microscope, title: "Advanced Lab Testing", body: "Track 65+ critical biomarkers with comprehensive CLIA-certified diagnostics to gain unprecedented visibility into your biology." },
  { Icon: Activity, title: "Biological Age Tracking", body: "Monitor the rate at which your cells are aging and see precisely how your lifestyle and clinical protocols reverse the clock over time." },
  { Icon: FlaskConical, title: "Personalized Supplement Protocols", body: "Receive tailor-made nutritional, nutraceutical, and lifestyle plans engineered specifically for your unique biological baseline." },
  { Icon: Stethoscope, title: "Dedicated Health Coaches", body: "Collaborate 1-on-1 with elite clinicians and coaches who actively interpret your data and accelerate your health goals." },
  { Icon: LayoutDashboard, title: "Smart Member Dashboard", body: "Centralize your health journey. Track daily progress, access clinical reports, manage appointments, and message your care team in one sleek interface." },
];

const STEPS = [
  { n: "1", title: "Assessment", body: "Comprehensive clinical intake evaluating lifestyle, family history, and longevity goals.", Icon: Stethoscope },
  { n: "2", title: "Lab Testing", body: "At-home DNA swab and a local blood draw tracing 65+ key cellular biomarkers.", Icon: Microscope },
  { n: "3", title: "AI Analysis", body: "Our precision engine cross-references your multi-omics with peer-reviewed longevity science.", Icon: Sparkles },
  { n: "4", title: "Personalized Protocol", body: "Receive your custom stack of nutraceuticals, peptides, and behavioral guidelines.", Icon: Beaker },
  { n: "5", title: "Continuous Monitoring", body: "Repeat testing and wearable data integrations track your cellular age over time.", Icon: Activity },
];

const ADVANTAGES = [
  { title: "Personalized Care", image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=600&q=70", body: "Every protocol is custom-engineered based on your unique genetic makeup, biomarker levels, and lifestyle goals. We never use one-size-fits-all templates." },
  { title: "Evidence-Based Recommendations", image: "/assets/clinical_lab.jpg", body: "Our interventions are strictly backed by peer-reviewed longevity science and clinical trials. No fads, just proven biological optimizations." },
  { title: "Expert Clinical Team", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=70", body: "You're paired with elite longevity physicians and performance coaches who actively monitor your progress and refine your protocols." },
  { title: "Continuous Monitoring", image: "/assets/continuous_monitoring.jpg", body: "Your health is dynamic. We use continuous biometric feedback loops to adjust your stack as your biological age improves." },
  { title: "Data Privacy & Security", image: "/assets/secure_vault.jpg", body: "Your genetic and clinical data is locked behind HIPAA-compliant, enterprise-grade encryption. Your health information is never sold." },
  { title: "Premium Member Experience", image: "/assets/hero_woman.jpg", body: "Enjoy a frictionless healthcare experience. From at-home testing to our elegant mobile dashboard, we've designed every touchpoint for your convenience." },
];

const BIOMARKERS = [
  { name: "Apolipoprotein B (ApoB)", target: "<80 mg/dL", value: "72 mg/dL", status: "Optimal", tone: "jade" as const },
  { name: "hs-CRP (Inflammation)", target: "<1.0 mg/L", value: "0.8 mg/L", status: "Optimal", tone: "jade" as const },
  { name: "Homocysteine", target: "<10.0 µmol/L", value: "14.2 µmol/L", status: "Elevated", tone: "coral" as const },
  { name: "Vitamin D (25-hydroxy)", target: "30-50 ng/mL", value: "31 ng/mL", status: "Borderline", tone: "amber" as const },
  { name: "HbA1c (Glycation)", target: "5.4-5.6%", value: "5.6%", status: "Borderline", tone: "amber" as const },
];

const PROGRAMS = [
  {
    name: "Starter Assessment",
    price: "$299",
    cadence: "one-time",
    image: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&w=600&q=70",
    blurb: "Understand your genetic aging variants and baseline biological pathways.",
    features: ["DNA Methylation Sequencing", "Biological Age Clock", "Methylation pathway risk audit", "Baseline Daily Protocol Blueprint"],
    cta: "Select Program",
    popular: false,
  },
  {
    name: "Complete Longevity",
    price: "$450",
    cadence: "per month",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=70",
    blurb: "Biannual blood audits, active stacked compounds, and continuous clinical oversight.",
    features: ["Everything in Starter", "65+ Blood Biomarker Assays", "Monthly protocol stack updates", "1-on-1 consultations with clinicians", "24/7 care team messaging"],
    cta: "Select Program",
    popular: true,
  },
  {
    name: "Executive Health",
    price: "$1,200",
    cadence: "per month",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=70",
    blurb: "Elite supervision, quarterly multi-omics panels, and bespoke compound stacks.",
    features: ["Everything in Complete", "Quarterly 85+ blood panel audits", "Full Body MRI (Annual)", "Continuous Glucose Monitor (CGM)", "Priority VIP booking & support"],
    cta: "Select Program",
    popular: false,
  },
];

const SECURITY = [
  { Icon: ShieldCheck, title: "HIPAA Compliant", body: "Your clinical biomarkers and health panel records are encrypted under federal Health Insurance Portability and Accountability Act standards." },
  { Icon: Dna, title: "GINA Privacy Protection", body: "Your DNA methylome sequencing data is shielded under the Genetic Information Nondiscrimination Act. It cannot be disclosed to employers or insurers." },
  { Icon: Lock, title: "Role-Based Access Control", body: "Data boundaries are locked down at the database layer. A member only ever views their own metrics; staff access is strictly assigned and controlled." },
  { Icon: KeyRound, title: "Mandatory Two-Factor Auth", body: "All clinical coaches, relationship leads, and administrators authenticate with a second factor. Idle sessions time out automatically to secure records." },
];

const FAQS = [
  { q: "How long does testing take?", a: "Initial home saliva swabs and local lab blood draws are processed within 7-10 business days. Once we receive the results, your personalized protocol is generated and reviewed by your clinical team within 48 hours." },
  { q: "How is my DNA protected?", a: "Your genetic data is shielded under the federal Genetic Information Nondiscrimination Act (GINA), encrypted at rest, and isolated at the database row level. It cannot be disclosed to insurers, employers, or marketing partners." },
  { q: "Can I cancel my membership?", a: "Yes — pause or cancel at any time from your member portal under Supplements or Settings. Cancellation takes effect at the end of the current billing cycle." },
  { q: "What biomarkers are included?", a: "Standard membership includes 65+ markers spanning cardiovascular (ApoB, Lp(a), hs-CRP), metabolic (fasting insulin, HbA1c, OGTT), inflammatory, hormonal, micronutrient, and biological-age clocks. Executive tier extends to 85+ markers and quarterly multi-omics." },
  { q: "How are recommendations personalized?", a: "Our precision engine triangulates your DNA, biomarker trends, intake history, and (optionally) wearable data, then your assigned clinician reviews and signs off on every protocol change. Nothing is auto-shipped without human review." },
  { q: "Is there ongoing coaching?", a: "Yes. Complete and Executive members get 1-on-1 monthly consultations plus 24/7 messaging with their assigned care team between sessions." },
];

const TESTIMONIALS = [
  {
    name: "Marcus Aurelius",
    role: "Managing Director",
    review: "VitalityX completely changed my perspective on executive performance. Tracing my ApoB and getting my biological age down by 5.2 years has given me a new baseline of energy.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "Dr. Elena Rostova",
    role: "Biomedical Researcher",
    review: "As a scientist, I was skeptical of commercial longevity programs. VitalityX's commitment to HIPAA compliance, GINA privacy, and ISO database standards convinced me. The protocols are strictly evidence-based.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "Sarah Jenkins",
    role: "Athletic Coach",
    review: "The personalized supplement stack is unmatched. I no longer guess which brands or dosages are right for my metabolic baseline. The health coaching adds an essential layer of guidance.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  }
];

export default function LandingPage() {
  return (
    <main data-testid="landing-page" className="overflow-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center pt-8 pb-20 md:py-28 overflow-hidden bg-gradient-to-b from-background to-[var(--vx-cream)]/10">
        <div className="grain absolute inset-0 opacity-[0.15]" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-32 hidden h-[700px] w-[700px] rounded-full bg-gradient-to-br from-[var(--vx-jade)]/10 to-transparent blur-[120px] md:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -bottom-32 hidden h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-amber-500/5 to-transparent blur-[120px] md:block"
        />

        <div className="relative mx-auto max-w-7xl px-6 w-full">
          <div className="grid items-center gap-16 md:grid-cols-2">
            
            {/* Left: Copy */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--vx-jade)]/20 bg-[var(--vx-jade)]/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--vx-jade)]">
                <span className="h-2 w-2 rounded-full bg-[var(--vx-jade)] animate-pulse" /> Precision Longevity Medicine
              </p>
              <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7.5xl text-[var(--vx-ink)]">
                Decode Your <span className="italic text-[var(--vx-jade)] font-normal">Biology</span>.
                <br />
                Optimize Your Life.
              </h1>
              <p className="max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                Personalized health programs powered by advanced blood diagnostics, DNA sequencing, elite health coaches, and data-driven compound protocols.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/signup" data-testid="hero-get-started" className="btn btn-primary h-12 px-8 flex items-center gap-2 text-sm shadow-lg shadow-[var(--vx-ink)]/15 hover:-translate-y-0.5 transition-all">
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link href="#features" className="btn btn-outline h-12 px-8 flex items-center justify-center text-sm bg-background/50 hover:bg-background transition-all">
                  Explore Features
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-4 border-t border-border/50 text-xs text-muted-foreground font-semibold">
                {TRUST_LIST.map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={14} className="text-[var(--vx-jade)] bg-[var(--vx-jade)]/10 p-0.5 rounded-full" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Premium image + Floating Glass Dashboard */}
            <div className="relative flex flex-col md:block gap-6 animate-in fade-in slide-in-from-right-6 duration-700 delay-100">
              
              {/* Image Frame */}
              <div className="relative overflow-hidden rounded-[32px] border border-border/80 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--vx-ink)]/30 via-transparent to-transparent pointer-events-none z-10" />
                <img
                  src="/assets/hero_woman.jpg"
                  alt="Healthy athletic young woman smiling confidently"
                  className="h-[520px] w-full object-cover saturate-[1.15] contrast-[1.05] brightness-[0.98] transition-transform duration-10000 hover:scale-105"
                />
              </div>

              {/* Floating Today's Overview card */}
              <div 
                className="
                  md:absolute md:bottom-6 md:-left-10 
                  w-full md:w-[280px] 
                  p-6 
                  shadow-2xl md:shadow-[0_30px_70px_rgba(0,0,0,0.18)] 
                  bg-white/80 dark:bg-[var(--vx-ink)]/70
                  backdrop-blur-[16px] md:backdrop-saturate-[1.8] 
                  border border-white/30 dark:border-white/10
                  rounded-[24px] 
                  z-20
                " 
                style={{ 
                  animation: "vxFade 0.6s ease-out 0.2s both, float 8s ease-in-out infinite" 
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Today&apos;s Overview</p>
                  <span className="flex items-center gap-1 text-[10px] text-[var(--vx-jade)] font-bold">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--vx-jade)]" /> Live Sync
                  </span>
                </div>
                
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Biological Age</p>
                    <p className="font-display text-4xl font-semibold text-[var(--vx-ink)] mt-1">32</p>
                    <p className="text-[9px] font-bold text-[var(--vx-jade)] mt-1">−5.2 yrs vs Chrono</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Health Score</p>
                    <p className="font-display text-4xl font-semibold text-[var(--vx-ink)] mt-1">89<span className="text-sm font-normal text-muted-foreground">/100</span></p>
                    <p className="text-[9px] font-bold text-[var(--vx-jade)] mt-1">Optimal</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-border/40 pt-4">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Next Diagnostic Draw</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--vx-ink)]">Blood Biomarkers · May 28, 2026</p>
                </div>
                
                <Link href="/login" className="mt-5 flex w-full items-center justify-center rounded-xl bg-[var(--vx-ink)] py-2.5 text-xs font-semibold text-white transition hover:bg-black/90 hover:shadow-lg shadow-sm">
                  View Dashboard →
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── TRUST SECTION (Credibility cards) ── */}
      <section className="py-16 border-y border-border/50 bg-background relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {TRUST_CARDS.map(({ title, description, Icon }) => (
              <div key={title} className="flex gap-4 p-6 vx-card vx-card-hover">
                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES ── */}
      <section id="features" className="bg-[var(--vx-cream)]/20 py-28 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--vx-jade)]">Comprehensive Ecosystem</p>
            <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">
              Everything You Need to Optimize Your Health
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              A premium longevity infrastructure built around clinical medicine, multi-omics databases, and dedicated supervision.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, body }) => (
              <div key={title} className="group relative p-6 vx-card vx-card-hover">
                <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-[100px] bg-gradient-to-br from-[var(--vx-jade)]/5 to-transparent pointer-events-none rounded-tr-2xl" />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--vx-jade)]/10 text-[var(--vx-jade)] transition-transform duration-300 group-hover:scale-105">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-28 bg-background relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--vx-jade)]">The Process</p>
            <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              A synchronized 5-step loop engineered to trace, compound, and optimize your biological markers.
            </p>
          </div>

          {/* Timeline workflow */}
          <div className="relative grid gap-10 lg:grid-cols-5 md:grid-cols-2">
            
            {/* Visual connector line for desktop */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[var(--vx-jade)]/10 via-[var(--vx-jade)]/40 to-[var(--vx-jade)]/10 -z-10" />

            {STEPS.map((s, idx) => {
              const StepIcon = s.Icon;
              return (
                <div key={s.n} className="group flex flex-col items-center text-center px-4 relative">
                  
                  {/* Step bubble with Icon */}
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-md transition group-hover:border-[var(--vx-jade)] group-hover:shadow-[var(--vx-jade)]/10 duration-300 mb-6">
                    <span className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--vx-ink)] text-white font-mono text-xs font-bold shadow-sm">
                      {s.n}
                    </span>
                    <StepIcon size={24} className="text-[var(--vx-jade)]" />
                  </div>

                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                    {s.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ADVANTAGE ── */}
      <section className="bg-[var(--vx-ink)] py-28 text-white relative">
        <div className="grain absolute inset-0 opacity-[0.05]" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="space-y-3 mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--vx-jade)]">The VitalityX Advantage</p>
            <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">Why Choose VitalityX</h2>
            <p className="text-sm sm:text-base text-white/60 max-w-xl">Healthcare built around your cellular records — not demographic averages.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ADVANTAGES.map((a) => (
              <div key={a.title} className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition hover:bg-white/[0.06] hover:border-white/20 duration-300 shadow-lg hover:-translate-y-1">
                <div className="aspect-[16/10] overflow-hidden bg-white/5 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--vx-ink)]/50 to-transparent z-10 pointer-events-none" />
                  <img src={a.image} alt={a.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--vx-jade)]/20 text-[var(--vx-jade)]"><Sparkles size={12} /></span>
                      <h3 className="font-display text-lg font-semibold">{a.title}</h3>
                    </div>
                    <p className="mt-4 text-sm text-white/70 leading-relaxed">{a.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLINICAL QUALITY / BIOMARKERS ── */}
      <section className="py-28 bg-background relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            
            <div className="space-y-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--vx-jade)]">Clinical Quality</p>
              <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">We Measure What Matters</h2>
              <p className="text-muted-foreground leading-relaxed">
                We translate raw biological inputs into plain-language clinical insights. By analyzing your cellular methylation markers and a comprehensive list of cardiovascular and metabolic indicators, our clinicians can pinpoint exact longevity optimizations.
              </p>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex gap-3">
                  <Check size={16} className="mt-0.5 shrink-0 text-[var(--vx-jade)] bg-[var(--vx-jade)]/10 p-0.5 rounded-full" />
                  <span><strong>GINA Sequenced:</strong> Complete genetic privacy under Federal Nondiscrimination protection.</span>
                </li>
                <li className="flex gap-3">
                  <Check size={16} className="mt-0.5 shrink-0 text-[var(--vx-jade)] bg-[var(--vx-jade)]/10 p-0.5 rounded-full" />
                  <span><strong>ISO 27001 Data Control:</strong> Your records are isolated at the database layer, never sold.</span>
                </li>
                <li className="flex gap-3">
                  <Check size={16} className="mt-0.5 shrink-0 text-[var(--vx-jade)] bg-[var(--vx-jade)]/10 p-0.5 rounded-full" />
                  <span><strong>Certified Laboratories:</strong> Assays processed in federally accredited pathology clinics.</span>
                </li>
              </ul>
            </div>

            <div className="vx-card overflow-hidden shadow-lg">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <img src="/assets/clinical_lab.jpg" alt="State-of-the-art clinical laboratory diagnostic equipment" className="h-56 w-full object-cover" loading="lazy" />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">Blood Biomarker Assay Preview</p>
                <ul className="space-y-4">
                  {BIOMARKERS.map((b) => (
                    <li key={b.name} className="border-b border-border/40 pb-3.5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{b.name}</p>
                        <span className={`badge ${b.tone === "jade" ? "badge-jade" : b.tone === "amber" ? "badge-amber" : "badge-coral"}`}>{b.status}</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Target: {b.target}</span>
                        <span className="font-mono font-bold">{b.value}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SUPPLEMENTS (Store Cards) ── */}
      <SupplementsSection />

      {/* ── PROGRAMS / PRICING ── */}
      <section id="programs" className="border-t border-border bg-[var(--vx-cream)]/20 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--vx-jade)]">Programs &amp; Pricing</p>
            <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">Choose Your Longevity Track</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Flexible health optimization programs designed around clinical precision.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
            {PROGRAMS.map((p) => (
              <div 
                key={p.name} 
                className={`relative flex flex-col justify-between bg-card p-6 vx-card vx-card-hover ${
                  p.popular 
                    ? "border-[var(--vx-jade)] ring-2 ring-[var(--vx-jade)]/20 shadow-lg" 
                    : "shadow-sm"
                }`}
                data-testid={`program-${p.name.toLowerCase().replace(/\s+/g,"-")}`}
              >
                {p.popular && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--vx-jade)] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[var(--vx-ink)] shadow-md z-10">Most Popular</span>
                )}
                
                <div>
                  {/* Decorative card image header */}
                  <div className="h-40 rounded-xl overflow-hidden mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover saturate-[1.10]" />
                  </div>

                  <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{p.blurb}</p>
                  
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-semibold">{p.price}</span>
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">/ {p.cadence}</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 text-xs border-t border-border/40 pt-6">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2.5 font-medium">
                        <Check size={14} className="mt-0.5 shrink-0 text-[var(--vx-jade)] bg-[var(--vx-jade)]/10 p-0.5 rounded-full" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  href="/signup" 
                  className={`btn mt-8 w-full justify-center h-12 text-sm font-semibold ${
                    p.popular 
                      ? "btn-primary hover:shadow-lg" 
                      : "btn-outline hover:shadow-sm"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className="py-28 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            
            <div className="relative overflow-hidden rounded-[32px] border border-border/80 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--vx-ink)]/20 via-transparent to-transparent pointer-events-none" />
              <img src="/assets/secure_vault.jpg" alt="Secure biometrically protected data server environment" className="h-[480px] w-full object-cover saturate-[1.10]" loading="lazy" />
            </div>

            <div className="space-y-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--vx-jade)]">Security &amp; Governance</p>
              <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">Clinical-Grade Security Architecture</h2>
              <p className="text-muted-foreground leading-relaxed">
                We handle sensitive genomic and lab diagnostic records. Our platform is engineered to place data security and patient autonomy above all.
              </p>
              <div className="mt-8 space-y-6">
                {SECURITY.map(({ Icon, title, body }) => (
                  <div key={title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 border-t border-border/40 bg-[var(--vx-cream)]/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--vx-jade)]">Testimonials</p>
            <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">What Members Say</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Real optimization journeys, verified clinical achievements.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="p-6 vx-card vx-card-hover flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-[var(--vx-jade)] text-[var(--vx-jade)]" />
                    ))}
                  </div>
                  <p className="text-sm italic text-foreground leading-relaxed mb-6 font-medium">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3.5 border-t border-border/30 pt-5 mt-auto">
                  <img src={t.image} alt={t.name} className="h-10 w-10 rounded-full object-cover border border-border/60" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{t.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-border bg-background py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--vx-jade)]">Support &amp; Knowledge</p>
            <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">Frequently Asked Questions</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Everything you need to know before optimization.</p>
          </div>

          {/* Accordion List */}
          <div className="mt-10 divide-y divide-border/60 vx-card overflow-hidden shadow-sm">
            {FAQS.map((f, i) => (
              <details key={i} className="group transition-all duration-300" data-testid={`faq-${i}`} name="faq-accordion">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 font-display text-lg font-semibold hover:bg-muted/10 transition-colors">
                  <span className="flex items-center gap-2">
                    <HelpCircle size={18} className="text-[var(--vx-jade)] shrink-0" />
                    {f.q}
                  </span>
                  <span className="ml-auto text-muted-foreground transition-transform duration-300 group-open:rotate-180">
                    <ChevronRight size={18} />
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/10">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-28 text-white overflow-hidden bg-gradient-to-br from-[var(--vx-ink)] to-neutral-900">
        <div className="grain absolute inset-0 opacity-[0.06]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none h-[500px] w-[500px] rounded-full bg-[var(--vx-jade)]/10 blur-[100px]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center space-y-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--vx-jade)]">Join The Future of Medicine</p>
          <h2 className="font-display text-4xl font-medium leading-[1.1] md:text-6xl text-white">
            Ready to Take Control<br />of Your Health?
          </h2>
          <p className="mx-auto max-w-xl text-white/75 text-sm md:text-base leading-relaxed">
            Start your personalized precision health journey today. Decode your biology and reverse your aging clock with elite clinical guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/signup" className="btn btn-jade h-12 px-8 flex items-center gap-2 text-sm shadow-md">
              Book Consultation <ArrowRight size={16} />
            </Link>
            <Link href="#programs" className="btn btn-outline h-12 px-8 border-white/20 text-white hover:bg-white/10 hover:border-white/30 flex items-center justify-center text-sm">
              Explore Programs
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-28 bg-background relative z-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="space-y-3 max-w-xl mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--vx-jade)]">Get In Touch</p>
            <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">Contact Our Clinical Team</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Have questions about our programs or your protocol? We&apos;re here to help.</p>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            <ContactForm />
            <div className="space-y-6">
              <h3 className="font-display text-xl font-bold border-b border-border/40 pb-3">Contact Information</h3>
              <InfoBlock title="Email Support" lines={["care@vitalityx.health"]} />
              <InfoBlock title="Phone" lines={["+1 (800) 555-0199"]} />
              <InfoBlock title="Office Address" lines={["100 Precision Way, Suite 400", "San Francisco, CA 94105"]} />
              <InfoBlock title="Business Hours" lines={["Mon – Fri: 8:00 AM – 6:00 PM (PST)", "Sat – Sun: Clinical Support Only"]} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="vx-card p-6 border border-border/40 bg-card/50">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{title}</p>
      {lines.map((l) => <p key={l} className="text-sm font-semibold text-foreground mt-0.5">{l}</p>)}
    </div>
  );
}
