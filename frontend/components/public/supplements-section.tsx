"use client";
import { useCart } from "@/components/cart/cart-provider";
import { toast } from "sonner";
import { PRODUCTS } from "@/lib/products";
import { Star, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function SupplementsSection() {
  const { add: addToCart } = useCart();
  const list = Object.values(PRODUCTS);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    setAddingId(product.id);
    addToCart({
      id: product.id,
      name: product.name,
      priceCents: product.priceCents,
      recurring: !!product.recurring,
    });
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAddingId(null), 500);
  };

  return (
    <section id="supplements" className="border-t border-border py-24 bg-[var(--vx-cream)]/10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">Featured Products</p>
        <h2 className="mt-3 text-center font-display text-4xl font-medium leading-tight md:text-5xl">
          Optimized Stacks &amp; Diagnostic Assays
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground mb-16">
          Our daily protocols leverage clinical-grade stacked supplements and diagnostics.
        </p>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 3).map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`}
              className="group flex flex-col bg-card rounded-[24px] overflow-hidden border border-border shadow-sm hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 ease-out"
              data-testid={`supplement-${product.id}`}
            >
              <div className="relative aspect-[4/3] bg-muted/20 overflow-hidden flex items-center justify-center p-8">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110 drop-shadow-md"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-background/80 backdrop-blur-md text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full border border-border/50 shadow-sm text-foreground">
                    {product.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col flex-grow bg-card relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < Math.floor(product.rating) ? "fill-[var(--vx-jade)] text-[var(--vx-jade)]" : "text-muted-foreground"} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1.5 font-medium">({product.reviewCount})</span>
                  </div>
                </div>
                
                <h3 className="font-display text-2xl font-semibold mb-3 line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="mb-8 flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {product.benefits?.slice(0, 3).map((benefit, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted/40 text-foreground px-2.5 py-1 rounded-md border border-border/50">
                        <Check size={12} className="text-[var(--vx-jade)]" /> {benefit}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-medium">${(product.priceCents / 100).toFixed(2)}</span>
                    {product.recurring && <span className="text-xs text-muted-foreground uppercase tracking-widest">/ month</span>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button 
                      className="btn btn-outline w-full justify-center text-sm font-medium h-11"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      View Details
                    </button>
                    <button 
                      onClick={(e) => handleAdd(e, product)}
                      disabled={addingId === product.id}
                      className="btn btn-primary w-full justify-center text-sm font-medium h-11 shadow-md hover:shadow-lg transition-shadow"
                    >
                      {addingId === product.id ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/products" className="btn btn-outline inline-flex items-center justify-center h-12 px-8 rounded-full">
            Shop All Diagnostics &amp; Compounds
          </Link>
        </div>
      </div>
    </section>
  );
}
