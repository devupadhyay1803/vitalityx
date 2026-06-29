"use client";

import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";
import { Star, Check, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = PRODUCTS[params.slug];
  const { add: addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  if (!product) {
    notFound();
  }

  const handleAdd = () => {
    setAdding(true);
    addToCart({
      id: product.id,
      name: product.name,
      priceCents: product.priceCents,
      recurring: !!product.recurring,
    });
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdding(false), 500);
  };

  return (
    <main className="min-h-screen pt-24 pb-24" data-testid="product-detail-page">
      <div className="mx-auto max-w-7xl px-6">
        <Link href="/supplements" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition">
          <ArrowLeft size={16} /> Back to Store
        </Link>
        
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="rounded-3xl border border-border bg-muted/20 overflow-hidden relative aspect-square shadow-sm flex items-center justify-center p-12">
             <img 
               src={product.image} 
               alt={product.name}
               className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl"
             />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <span className="text-xs uppercase tracking-widest text-[var(--vx-jade)] font-semibold mb-3">
              {product.category}
            </span>
            <h1 className="font-display text-4xl font-semibold md:text-5xl leading-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-[var(--vx-jade)] text-[var(--vx-jade)]" : "text-muted-foreground"} />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground underline decoration-dotted">({product.reviewCount} reviews)</span>
            </div>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {product.description}
            </p>
            
            <div className="text-4xl font-display mb-8">
              ${(product.priceCents / 100).toFixed(2)}
              {product.recurring && <span className="text-base text-muted-foreground ml-2">/ month</span>}
            </div>

            <ul className="space-y-3 mb-10 text-sm">
              <li className="flex gap-3 items-center"><Check size={16} className="text-[var(--vx-jade)]" /> Third-party lab tested for purity</li>
              <li className="flex gap-3 items-center"><Check size={16} className="text-[var(--vx-jade)]" /> Formulated by longevity physicians</li>
              {product.recurring && <li className="flex gap-3 items-center"><Check size={16} className="text-[var(--vx-jade)]" /> Pause or cancel subscription anytime</li>}
            </ul>

            <button 
              onClick={handleAdd}
              disabled={adding}
              className="btn btn-jade w-full justify-center text-lg py-6 shadow-xl hover:shadow-2xl transition-all"
            >
              {adding ? "Adding..." : `Add to Cart — $${(product.priceCents / 100).toFixed(2)}`}
            </button>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 py-3 rounded-full">
              <ShieldCheck size={14} /> 100% Satisfaction Guarantee. Hassle-free returns.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
