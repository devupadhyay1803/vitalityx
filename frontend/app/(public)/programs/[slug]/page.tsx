"use client";

import { notFound, useRouter } from "next/navigation";
import { PROGRAMS } from "@/lib/programs";
import { useCart } from "@/components/cart/cart-provider";
import { Star, Check, ShieldCheck, ArrowLeft, ChevronDown, Stethoscope, Clock, Users, Flame } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";

export default function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const program = PROGRAMS[resolvedParams.slug];
  const { add: addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  if (!program) {
    notFound();
  }

  const handleAdd = () => {
    setAdding(true);
    // Program quantity is strictly 1
    addToCart({
      id: program.id,
      name: program.name,
      priceCents: program.priceCents,
      recurring: program.recurring,
    });
    toast.success(`Joined ${program.name}`);
    setTimeout(() => {
      setAdding(false);
      router.push("/cart");
    }, 400);
  };

  return (
    <main className="min-h-screen pt-24 pb-32" data-testid="program-detail-page">
      {/* 1. Hero Banner */}
      <div className="relative w-full h-[60vh] min-h-[500px] bg-[var(--vx-ink)] overflow-hidden">
        <img 
          src={program.image} 
          alt={program.name} 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--vx-ink)] via-[var(--vx-ink)]/60 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-24">
          <div className="mx-auto max-w-7xl px-6 w-full">
            <Link href="/programs" className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white mb-8 transition-colors">
              <ArrowLeft size={16} /> Back to Programs
            </Link>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-[var(--vx-jade)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--vx-ink)] shadow-sm">
                {program.category}
              </span>
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
                <Clock size={12} className="inline mr-1" /> {program.duration}
              </span>
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
                <Stethoscope size={12} className="inline mr-1" /> Physician-Led
              </span>
            </div>
            
            <h1 className="font-display text-5xl font-semibold md:text-7xl leading-tight mb-6 tracking-tight text-white max-w-4xl">
              {program.name}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl leading-relaxed font-light">
              {program.blurb}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        
        <div className="grid lg:grid-cols-3 gap-16 -mt-10 relative z-10">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-24 pt-20">
            
            {/* About Program */}
            <section>
              <h2 className="font-display text-3xl font-semibold mb-6">The Philosophy</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {program.about}
              </p>
            </section>

            {/* Benefits */}
            <section>
              <h2 className="font-display text-3xl font-semibold mb-8">Expected Outcomes</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {program.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-4 bg-muted/30 p-5 rounded-2xl border border-border">
                    <div className="bg-[var(--vx-jade)]/10 p-2 rounded-xl text-[var(--vx-jade)] shrink-0">
                      <Flame size={20} />
                    </div>
                    <span className="font-medium text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* What's Included */}
            <section>
              <h2 className="font-display text-3xl font-semibold mb-8">What's Included</h2>
              <ul className="space-y-4">
                {program.whatsIncluded.map((item, i) => (
                  <li key={i} className="flex gap-4 items-start p-6 bg-card border border-border rounded-2xl shadow-sm">
                    <ShieldCheck size={24} className="text-[var(--vx-jade)] shrink-0" />
                    <span className="text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Timeline */}
            <section>
              <h2 className="font-display text-3xl font-semibold mb-10">Program Timeline</h2>
              <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border before:to-transparent">
                {program.timeline.map((step, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-[var(--vx-jade)] text-[var(--vx-ink)] font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {i + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-card border border-border shadow-sm">
                      <div className="text-xs uppercase tracking-widest text-[var(--vx-jade)] font-bold mb-2">{step.week}</div>
                      <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Who is this for? */}
            <section className="bg-[var(--vx-cream)]/20 p-10 rounded-[32px] border border-border">
              <h2 className="font-display text-3xl font-semibold mb-6">Who Is This For?</h2>
              <div className="flex flex-wrap gap-3">
                {program.audience.map((aud, i) => (
                  <span key={i} className="px-5 py-2.5 bg-background border border-border rounded-full text-sm font-medium shadow-sm flex items-center gap-2">
                    <Users size={16} className="text-muted-foreground" /> {aud}
                  </span>
                ))}
              </div>
            </section>

            {/* Care Team */}
            <section>
              <h2 className="font-display text-3xl font-semibold mb-8">Your Care Team</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {program.careTeam.map((member, i) => (
                  <div key={i} className="p-6 border border-border rounded-3xl bg-card">
                    <div className="text-xs uppercase tracking-widest text-[var(--vx-jade)] font-bold mb-2">{member.role}</div>
                    <h4 className="font-display text-xl font-semibold mb-3">{member.name}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Accordion */}
            <section className="pb-10">
              <h2 className="font-display text-3xl font-semibold mb-8">Common Questions</h2>
              <div className="space-y-4">
                {program.faqs.map((faq, i) => (
                  <div key={i} className="border border-border rounded-2xl bg-card overflow-hidden transition-all">
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between font-medium text-lg hover:bg-muted/30 transition-colors"
                    >
                      {faq.question}
                      <ChevronDown className={`transform transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar - Sticky Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-card border border-border rounded-[32px] p-8 shadow-xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(program.rating) ? "fill-[var(--vx-jade)] text-[var(--vx-jade)]" : "text-muted-foreground/30"} />
                ))}
                <span className="text-sm font-medium ml-2">{program.rating} / 5.0</span>
              </div>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-display text-5xl font-semibold tracking-tight">${(program.priceCents / 100).toFixed(0)}</span>
                <span className="text-muted-foreground">/ {program.cadence}</span>
              </div>

              <ul className="space-y-4 mb-10 text-sm font-medium">
                <li className="flex gap-4 items-start"><Check size={18} className="text-[var(--vx-jade)] shrink-0" /> Full clinical supervision</li>
                <li className="flex gap-4 items-start"><Check size={18} className="text-[var(--vx-jade)] shrink-0" /> At-home lab testing included</li>
                {program.recurring && <li className="flex gap-4 items-start"><Check size={18} className="text-[var(--vx-jade)] shrink-0" /> Pause or cancel anytime</li>}
              </ul>

              <button 
                onClick={handleAdd}
                disabled={adding}
                className="btn btn-primary w-full justify-center text-lg h-14 mb-4 shadow-[0_10px_40px_-10px_var(--vx-jade)] hover:shadow-[0_20px_60px_-15px_var(--vx-jade)] transition-shadow"
              >
                {adding ? "Processing..." : "Add to Cart"}
              </button>
              
              <button className="btn btn-outline w-full justify-center text-base h-12">
                Book Free Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Related Programs */}
        <div className="mt-32 border-t border-border pt-24 mb-10">
          <h2 className="font-display text-3xl font-semibold text-center mb-12 tracking-tight">Other Health Journeys</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {Object.values(PROGRAMS)
              .filter(p => p.id !== program.id)
              .slice(0, 3)
              .map(p => (
                <Link key={p.id} href={`/programs/${p.id}`} className="group block border border-border rounded-[24px] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card">
                  <div className="aspect-video bg-muted/20 relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h4 className="font-semibold text-lg">{p.name}</h4>
                    </div>
                  </div>
                </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
