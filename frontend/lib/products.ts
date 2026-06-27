// Server-side product catalog (DO NOT trust client prices)
export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  recurring: boolean;
};

export const PRODUCTS: Record<string, Product> = {
  "omega-3-concentrate": {
    id: "omega-3-concentrate",
    name: "Omega-3 Concentrate",
    description: "2.4g EPA+DHA per serving · 30-day supply",
    priceCents: 4400,
    recurring: true,
  },
  "creatine-monohydrate": {
    id: "creatine-monohydrate",
    name: "Creatine Monohydrate",
    description: "5g per scoop · 30-day supply",
    priceCents: 1800,
    recurring: true,
  },
  "vitamin-d3-k2": {
    id: "vitamin-d3-k2",
    name: "Vitamin D3 + K2",
    description: "Personalized dosing · 30-day supply",
    priceCents: 2200,
    recurring: true,
  },
};
