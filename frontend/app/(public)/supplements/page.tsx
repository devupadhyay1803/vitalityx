import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { Star, ArrowRight, ShoppingBag } from "lucide-react";

export const metadata = {
 title: "Clinical Supplements & Tests — VitalityX",
 description: "Shop our premium, clinically dosed nutraceuticals and diagnostic kits.",
};

export default function SupplementsStorefront() {
 const productList = Object.values(PRODUCTS);

 return (
 <main className="min-h-screen pt-24 pb-24" data-testid="storefront-page">
 <div className="mx-auto max-w-7xl px-6">
 <div className="text-center max-w-3xl mx-auto mb-16">
 <p className="text-xs uppercase tracking-widest text-[var(--vx-jade)] font-semibold">Store</p>
 <h1 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
 Clinical-Grade Supplements
 </h1>
 <p className="mt-4 text-lg text-muted-foreground">
 Strictly peer-reviewed ingredients. Optimal bioavailability. Third-party tested for purity and potency.
 </p>
 </div>

 <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
 {productList.map((product) => (
 <Link 
 key={product.id} 
 href={`/supplements/${product.id}`}
 className="group flex flex-col vx-card overflow-hidden hover:shadow-xl transition-all hover:border-[var(--vx-jade)]/40"
 data-testid={`product-card-${product.id}`}
 >
 <div className="aspect-square bg-muted/30 overflow-hidden relative">
 <img 
 src={product.image} 
 alt={product.name} 
 className="w-full h-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105"
 />
 <span className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full border border-border">
 {product.category}
 </span>
 </div>
 <div className="p-6 flex flex-col flex-grow">
 <div className="flex items-center gap-1 mb-2">
 {[...Array(5)].map((_, i) => (
 <Star key={i} size={12} className={i < Math.floor(product.rating) ? "fill-[var(--vx-jade)] text-[var(--vx-jade)]" : "text-muted-foreground"} />
 ))}
 <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
 </div>
 <h3 className="font-display text-xl font-semibold mb-2 line-clamp-1">{product.name}</h3>
 <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-grow">{product.description}</p>
 
 <div className="flex items-center justify-between mt-auto">
 <span className="font-display text-xl">${(product.priceCents / 100).toFixed(2)}</span>
 <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--vx-ink)] text-white group-hover:bg-[var(--vx-jade)] group-hover:text-[var(--vx-ink)] transition-colors">
 <ShoppingBag size={18} />
 </span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </main>
 );
}
