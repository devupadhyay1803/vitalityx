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
};

export const PRODUCTS: Record<string, Product> = {
  "omega-3-concentrate": {
    id: "omega-3-concentrate",
    name: "Omega-3 Concentrate",
    description: "High-potency EPA/DHA formula for cardiovascular and cognitive support.",
    priceCents: 3500,
    recurring: true,
    image: "/assets/omega3_bottle.jpg",
    category: "Active Supplement",
    rating: 4.7,
    reviewCount: 95,
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
  },
};
