export type Program = {
  id: string;
  name: string;
  priceCents: number;
  cadence: string;
  recurring: boolean;
  image: string;
  category: string;
  duration: string;
  blurb: string;
  about: string;
  rating: number;
  benefits: string[];
  whatsIncluded: string[];
  timeline: { week: string; title: string; desc: string }[];
  audience: string[];
  careTeam: { role: string; name: string; bio: string }[];
  faqs: { question: string; answer: string }[];
  popular: boolean;
};

export const PROGRAMS: Record<string, Program> = {
  "starter-assessment": {
    id: "starter-assessment",
    name: "Starter Assessment",
    priceCents: 29900,
    cadence: "one-time",
    recurring: false,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    category: "Assessment",
    duration: "4 Weeks",
    blurb: "Understand your genetic aging variants and baseline biological pathways.",
    about: "The Starter Assessment is your entry point into precision medicine. We decode your DNA and evaluate your current biological age, giving you a definitive baseline and a clear roadmap for optimization.",
    rating: 4.8,
    benefits: ["Understand Genetic Baseline", "Calculate Biological Age", "Personalized Starting Protocol"],
    whatsIncluded: [
      "DNA Methylation Sequencing Kit",
      "Biological Age Clock Report",
      "Methylation pathway risk audit",
      "Baseline Daily Protocol Blueprint",
      "1x Physician Consultation"
    ],
    timeline: [
      { week: "Week 1", title: "Kit Delivery & Swab", desc: "Receive your DNA kit at home, provide a saliva sample, and mail it back to our lab." },
      { week: "Week 3", title: "Data Processing", desc: "Our laboratory runs advanced epigenomic sequencing on your sample." },
      { week: "Week 4", title: "Physician Review", desc: "Meet with your clinician to review your biological age and receive your protocol." }
    ],
    audience: ["Longevity Beginners", "Adults 30+", "Health Optimizers"],
    careTeam: [
      { role: "Lead Physician", name: "Dr. Sarah Jenkins, MD", bio: "Board-certified in Anti-Aging and Regenerative Medicine." },
      { role: "Genomics Specialist", name: "Dr. Michael Chen, PhD", bio: "Expert in epigenetic clocks and DNA methylation pathways." }
    ],
    faqs: [
      { question: "How long does the DNA kit take?", answer: "Kits typically arrive within 3 days. Once mailed back, laboratory processing takes approximately 14-20 days." },
      { question: "Is my data secure?", answer: "Absolutely. All genetic data is strictly protected under GINA and is never shared or sold." }
    ],
    popular: false,
  },
  "complete-longevity": {
    id: "complete-longevity",
    name: "Complete Longevity",
    priceCents: 45000,
    cadence: "per month",
    recurring: true,
    image: "/assets/continuous_monitoring.jpg",
    category: "Membership",
    duration: "12 Months (Billed Monthly)",
    blurb: "Biannual blood audits, active stacked compounds, and continuous clinical oversight.",
    about: "Our flagship clinical membership. We move beyond static health checkups by implementing continuous biometric feedback loops. Every quarter, we test, review, and refine your stack to continuously drive down your biological age.",
    rating: 4.9,
    benefits: ["Reverse Biological Aging", "Optimize Hormone Health", "Enhance Energy & Recovery", "Reduce Inflammation"],
    whatsIncluded: [
      "Everything in Starter Assessment",
      "65+ Blood Biomarker Assays (Biannual)",
      "Monthly protocol stack updates",
      "1-on-1 monthly consultations with clinicians",
      "24/7 care team messaging",
      "Prescription access (if clinically indicated)"
    ],
    timeline: [
      { week: "Month 1", title: "Onboarding & Baseline", desc: "Complete your initial comprehensive 65+ biomarker blood draw and DNA sequencing." },
      { week: "Month 2", title: "Protocol Initiation", desc: "Begin your highly personalized nutraceutical and prescription protocol." },
      { week: "Month 6", title: "Mid-Year Audit", desc: "Repeat blood draws to measure progress and adjust dosages." },
      { week: "Month 12", title: "Annual Review", desc: "Comprehensive review of biological age reversal and year-two planning." }
    ],
    audience: ["High Performers", "Adults 40+", "Longevity Enthusiasts", "Hormone Optimization"],
    careTeam: [
      { role: "Lead Physician", name: "Dr. Elena Rodriguez, MD", bio: "Specializes in hormone optimization and metabolic health." },
      { role: "Health Coach", name: "Marcus Thorne", bio: "Former elite athlete and certified longevity performance coach." }
    ],
    faqs: [
      { question: "Are supplements included in the price?", answer: "No, supplements and prescriptions are billed separately based on your personalized stack. However, members receive a 20% discount on all Apothecary items." },
      { question: "Can I cancel anytime?", answer: "Yes, you can pause or cancel your membership at any time from your portal. You will retain access until the end of your billing cycle." },
      { question: "Where do I get my blood drawn?", answer: "We partner with over 4,000 local diagnostic clinics nationwide. You can simply walk into a partner clinic near you." }
    ],
    popular: true,
  },
  "executive-health": {
    id: "executive-health",
    name: "Executive Health",
    priceCents: 120000,
    cadence: "per month",
    recurring: true,
    image: "/assets/hero_woman.jpg",
    category: "Elite Membership",
    duration: "12 Months (Billed Monthly)",
    blurb: "Elite supervision, quarterly multi-omics panels, and bespoke compound stacks.",
    about: "Designed for individuals who demand the absolute highest tier of clinical precision. The Executive Health program incorporates advanced imaging, continuous monitoring, and VIP access to our leading physicians for uncompromising health optimization.",
    rating: 5.0,
    benefits: ["Uncompromising Precision", "Early Disease Detection", "Peak Cognitive Performance", "Bespoke Biological Engineering"],
    whatsIncluded: [
      "Everything in Complete Longevity",
      "Quarterly 85+ blood panel audits",
      "Full Body MRI & Cleerly Heart Scan (Annual)",
      "Continuous Glucose Monitor (CGM) Supply",
      "Priority VIP booking & immediate support",
      "Concierge at-home blood draws"
    ],
    timeline: [
      { week: "Month 1", title: "Deep Diagnostics", desc: "At-home phlebotomy, CGM placement, and scheduling of advanced imaging." },
      { week: "Month 2", title: "Multi-Omic Synthesis", desc: "Physician team synthesizes genomics, blood, and imaging data into a master protocol." },
      { week: "Quarterly", title: "Aggressive Optimization", desc: "Every 3 months, complete lab work is re-run at your home to fine-tune the protocol." }
    ],
    audience: ["Executives", "Elite Athletes", "Longevity Purists"],
    careTeam: [
      { role: "Chief Medical Officer", name: "Dr. James Sterling, MD", bio: "World-renowned longevity physician." },
      { role: "Concierge Manager", name: "Sarah Lin", bio: "Your dedicated point of contact for all logistics and scheduling." }
    ],
    faqs: [
      { question: "Does this include the Full Body MRI?", answer: "Yes, an annual Full Body MRI and a Cleerly AI Heart Scan are fully covered under this membership." },
      { question: "What is a CGM?", answer: "A Continuous Glucose Monitor is a small wearable sensor that tracks your blood sugar in real-time, allowing us to perfectly map your metabolic responses to specific foods." }
    ],
    popular: false,
  }
};
