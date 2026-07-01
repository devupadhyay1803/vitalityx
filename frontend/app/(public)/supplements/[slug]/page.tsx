"use client";

import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";
import { Star, Check, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
 const resolvedParams = use(params);
 const product = PRODUCTS[resolvedParams.slug];
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
 className="btn btn-jade w-full justify-center text-lg shadow-xl hover:shadow-2xl transition-all"
 >
 {adding ? "Adding..." : `Add to Cart — $${(product.priceCents / 100).toFixed(2)}`}
 </button>
 
 <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 py-3 rounded-full">
 <ShieldCheck size={14} /> 100% Satisfaction Guarantee. Hassle-free returns.
 </div>

 <div className="mt-12 space-y-8 border-t border-border pt-12">
 <div>
 <h3 className="font-display text-2xl font-semibold mb-4">Core Benefits</h3>
 <ul className="grid gap-3">
 {product.benefits?.map((benefit, i) => (
 <li key={i} className="flex gap-3 items-start bg-muted/30 p-4 rounded-xl">
 <div className="bg-[var(--vx-jade)]/20 p-1 rounded-full shrink-0">
 <Check size={16} className="text-[var(--vx-jade)]" />
 </div>
 <span className="text-sm font-medium">{benefit}</span>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h3 className="font-display text-2xl font-semibold mb-4">Active Ingredients</h3>
 <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
 {product.ingredients?.map((ingredient, i) => (
 <li key={i}>{ingredient}</li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </div>

 {/* Related Products */}
 <div className="mt-32 border-t border-border pt-16">
 <h2 className="font-display text-3xl font-semibold text-center mb-10">Frequently Bought Together</h2>
 <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
 {Object.values(PRODUCTS)
 .filter(p => p.id !== product.id)
 .slice(0, 3)
 .map(p => (
 <Link key={p.id} href={`/supplements/${p.id}`} className="group block border border-border rounded-2xl overflow-hidden hover:border-[var(--vx-jade)]/50 transition">
 <div className="aspect-[4/3] bg-muted/20 p-6 flex items-center justify-center">
 <img src={p.image} alt={p.name} className="h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500" />
 </div>
 <div className="p-4 border-t border-border">
 <h4 className="font-medium truncate">{p.name}</h4>
 <p className="text-sm text-muted-foreground mt-1">${(p.priceCents / 100).toFixed(2)}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </div>
 </main>
 );
}
