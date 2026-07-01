"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = [
 { q: "What is VitalityX?", a: "VitalityX is a precision longevity program. We pair quarterly biomarker testing, genetic context, and one assigned human coach to lower your biological age." },
 { q: "Is this medical care?", a: "No. VitalityX is not a medical service. We provide lifestyle, nutrition, sleep and supplement guidance. We do not diagnose disease or prescribe medication. Always consult your physician." },
 { q: "How much does it cost?", a: "The platform fee is $149/month, which includes coaching, your member portal, and quarterly lab review. Labs and supplements are billed separately at cost-plus." },
 { q: "Who is my coach?", a: "Each member is assigned a single coach — a credentialed health professional (RD, RN, ATC, or PhD-level) — who builds your protocol with you and reviews it every six weeks." },
 { q: "Where does my data live?", a: "Encrypted on Supabase Postgres in the United States, behind row-level security and a service we audit. Genetic data is additionally GINA-protected." },
 { q: "Can I cancel anytime?", a: "Yes. Pause or cancel from your portal under Supplements or Settings. Cancellation takes effect at the end of the current billing cycle." },
 { q: "Do I have to upload my DNA?", a: "No — genetic upload is optional. The protocol works on biomarkers alone. If you do upload, GINA protections apply automatically." },
 { q: "What if I have a question between sessions?", a: "Use the in-portal Messages tab. Coaches respond within one business day. Urgent medical concerns should go to your physician, not your coach." },
];

export default function HelpPage() {
 const [open, setOpen] = useState<number | null>(0);
 return (
 <article data-testid="legal-help" className="mx-auto max-w-3xl px-6 py-16">
 <p className="text-xs uppercase tracking-widest text-muted-foreground">Help</p>
 <h1 className="mt-2 font-display text-5xl font-medium tracking-tight">Frequently asked</h1>
 <p className="mt-3 text-muted-foreground">Don&apos;t see your question? Email <a href="mailto:hi@vitalityx.com" className="underline">hi@vitalityx.com</a>.</p>

 <div className="mt-10 divide-y divide-border vx-card">
 {FAQ.map((item, i) => (
 <button
 key={i}
 data-testid={`faq-item-${i}`}
 onClick={() => setOpen(open === i ? null : i)}
 className="w-full text-left"
 >
 <div className="flex items-center justify-between px-5 py-4">
 <span className="font-display text-lg">{item.q}</span>
 <ChevronDown size={16} className={`transition ${open === i ? "rotate-180" : ""}`} />
 </div>
 {open === i && <p className="px-5 pb-5 text-sm text-muted-foreground">{item.a}</p>}
 </button>
 ))}
 </div>
 </article>
 );
}
