// Server-side product catalog (DO NOT trust client prices)
export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  recurring: boolean;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  ingredients: string[];
  benefits: string[];
  // Rich data for detailed product pages
  howToUse: string;
  whoShouldUse: string[];
  clinicalResearch: string;
  faqs: { question: string; answer: string }[];
  reviews: { id: string; author: string; rating: number; date: string; content: string }[];
};

export const PRODUCTS: Record<string, Product> = {
  "omega-3-concentrate": {
    id: "omega-3-concentrate",
    name: "Omega-3 Concentrate",
    description: "High-potency EPA/DHA formula for cardiovascular and cognitive support.",
    priceCents: 3500,
    recurring: true,
    image: "/assets/supplement_bottle.jpg",
    category: "Active Supplement",
    rating: 4.7,
    reviewCount: 95,
    ingredients: ["Omega-3 Fatty Acids (EPA/DHA) 2000mg", "Astaxanthin 4mg", "Vitamin E (D-alpha tocopherol)"],
    benefits: ["Supports cardiovascular health", "Promotes joint mobility", "Enhances cognitive function and focus"],
    howToUse: "Take 2 softgels daily with a meal, ideally in the morning to maximize absorption.",
    whoShouldUse: ["Athletes", "Adults 30+", "Longevity Enthusiasts"],
    clinicalResearch: "Our Omega-3 is sourced from wild-caught Alaskan Pollock and molecularly distilled for purity. Clinical trials demonstrate a 25% improvement in cardiovascular markers over 12 weeks of consistent use.",
    faqs: [
      { question: "Is there a fishy aftertaste?", answer: "No. Our formulation includes natural lemon oil and is enteric-coated to prevent fish burps." },
      { question: "Can I take this on an empty stomach?", answer: "We recommend taking it with a meal containing fats to optimize the absorption of the EPA and DHA." }
    ],
    reviews: [
      { id: "r1", author: "Michael T.", rating: 5, date: "Oct 12, 2025", content: "Best omega supplement I've tried. No fishy burps and I feel noticeably sharper." },
      { id: "r2", author: "Sarah W.", rating: 4, date: "Sep 28, 2025", content: "Great quality, my joint pain has decreased significantly since starting this protocol." }
    ]
  },
  "nmn-resveratrol": {
    id: "nmn-resveratrol",
    name: "VitalityX NMN + Resveratrol",
    description: "Cellular NAD+ booster promoting DNA repair, sirtuin activation, and mitochondrial function.",
    priceCents: 9500,
    recurring: true,
    image: "/assets/supplement_bottle.jpg",
    category: "Active Supplement",
    rating: 4.9,
    reviewCount: 128,
    ingredients: ["Nicotinamide Mononucleotide (NMN) 500mg", "Trans-Resveratrol 250mg", "Black Pepper Extract 5mg"],
    benefits: ["Boosts cellular energy production", "Activates longevity pathways", "Supports healthy aging and DNA repair"],
    howToUse: "Take 2 capsules every morning on an empty stomach to maximize NAD+ synthesis peaks.",
    whoShouldUse: ["Longevity Enthusiasts", "Busy Professionals", "Adults 40+"],
    clinicalResearch: "NMN is a direct precursor to NAD+, a critical coenzyme for cellular metabolism. Paired with Resveratrol (a sirtuin activator), this dual-action formula leverages the latest research from leading longevity institutes to combat cellular senescence.",
    faqs: [
      { question: "Should I keep this refrigerated?", answer: "Our NMN is stabilized and can be stored at room temperature, though refrigeration can extend shelf life past 12 months." },
      { question: "Why is black pepper extract included?", answer: "Black pepper extract (Piperine) significantly increases the bioavailability of Resveratrol, ensuring your body can utilize it effectively." }
    ],
    reviews: [
      { id: "r3", author: "David L.", rating: 5, date: "Nov 02, 2025", content: "I've been on this for 3 months and my afternoon energy crashes are completely gone." },
      { id: "r4", author: "Emma S.", rating: 5, date: "Oct 19, 2025", content: "Premium quality. I can literally feel the mitochondrial boost within 30 minutes of taking it." }
    ]
  },
  "magnesium-l-threonate": {
    id: "magnesium-l-threonate",
    name: "Magnesium L-Threonate Stack",
    description: "Highly bioavailable magnesium engineered to cross the blood-brain barrier for cognitive health and deep sleep.",
    priceCents: 4500,
    recurring: true,
    image: "/assets/magnesium_bottle.jpg",
    category: "Active Supplement",
    rating: 4.8,
    reviewCount: 84,
    ingredients: ["Magnesium L-Threonate 144mg", "Magnesium Glycinate 200mg", "Apigenin 50mg"],
    benefits: ["Promotes deep, restorative sleep", "Supports neuroplasticity", "Reduces stress and muscle tension"],
    howToUse: "Take 3 capsules 30-60 minutes before bed. For acute stress, take 1 capsule during the day.",
    whoShouldUse: ["Poor Sleepers", "High-Stress Individuals", "Athletes"],
    clinicalResearch: "Magnesium L-Threonate is the only form of magnesium clinically proven to effectively cross the blood-brain barrier, directly increasing brain magnesium levels to enhance synaptic density and cognitive function.",
    faqs: [
      { question: "Will this make me groggy in the morning?", answer: "No, this stack promotes natural deep sleep architecture without the hangover effect of chemical sleep aids." },
      { question: "What is Apigenin?", answer: "Apigenin is a natural flavonoid found in chamomile tea that binds to benzodiazepine receptors in the brain, promoting relaxation." }
    ],
    reviews: [
      { id: "r5", author: "James B.", rating: 5, date: "Jan 14, 2026", content: "My WHOOP recovery scores have literally doubled since taking this before bed." },
      { id: "r6", author: "Amanda K.", rating: 4, date: "Dec 03, 2025", content: "Great for sleep, though I wish the bottle contained a full 45-day supply." }
    ]
  },
  "dna-methylation-kit": {
    id: "dna-methylation-kit",
    name: "VitalityX DNA Methylation Kit",
    description: "Comprehensive genomic sequencing kit targeting longevity genes and biological age risk indicators.",
    priceCents: 29900,
    recurring: false,
    image: "/assets/dna_kit.jpg",
    category: "Diagnostic Assay",
    rating: 5.0,
    reviewCount: 312,
    ingredients: ["Saliva collection tube", "Pre-paid return shipping label", "Secure laboratory analysis processing"],
    benefits: ["Measures exact biological age", "Identifies longevity risk markers", "Personalizes your VitalityX protocol"],
    howToUse: "Provide a saliva sample in the included tube, register your kit online, and return it using the prepaid mailer. Results typically arrive in 3-4 weeks.",
    whoShouldUse: ["Health Optimizers", "Biohackers", "Anyone curious about their biological aging rate"],
    clinicalResearch: "We utilize next-generation epigenomic sequencing to analyze over 900,000 CpG sites on your DNA. Our proprietary Horvath-derived clocks provide the most accurate assessment of biological age available on the market.",
    faqs: [
      { question: "Is my genetic data kept private?", answer: "Yes. Your data is anonymized, fully encrypted, and never sold to third parties. You have the right to delete your genomic data at any time." },
      { question: "How often should I retest?", answer: "We recommend retesting every 6-12 months to track the efficacy of your longevity protocol and lifestyle interventions." }
    ],
    reviews: [
      { id: "r7", author: "Dr. Peter C.", rating: 5, date: "Feb 22, 2026", content: "The most comprehensive methylation panel I've seen available direct-to-consumer. Highly actionable insights." },
      { id: "r8", author: "Lisa M.", rating: 5, date: "Feb 10, 2026", content: "The results completely changed how I approach my diet and supplement routine. Worth every penny." }
    ]
  },
};
