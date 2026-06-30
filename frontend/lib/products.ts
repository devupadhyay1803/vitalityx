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
    benefits: ["Boosts cellular energy production (NAD+)", "Activates longevity pathways (Sirtuins)", "Supports healthy aging and DNA repair"],
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
    benefits: ["Measures your exact biological age", "Identifies specific longevity risk markers", "Personalizes your VitalityX protocol"],
  },
};
