"use client";

import { notFound, useRouter } from "next/navigation";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";
import { Star, Check, ShieldCheck, ArrowLeft, Heart, ChevronDown, FlaskConical, Stethoscope, Droplet, User } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const product = PRODUCTS[resolvedParams.slug];
  const { add: addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  if (!product) {
    notFound();
  }

  const handleAdd = () => {
    setAdding(true);
    for(let i=0; i<quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
        recurring: !!product.recurring,
      });
    }
    toast.success(`${quantity}x ${product.name} added to cart`);
    setTimeout(() => setAdding(false), 500);
  };

  const handleBuyNow = () => {
    setBuying(true);
    for(let i=0; i<quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
        recurring: !!product.recurring,
      });
    }
    setTimeout(() => {
      router.push("/cart");
    }, 400);
  };

  return (
    <main className="min-h-screen pt-24 pb-32" data-testid="product-detail-page">
      <div className="mx-auto max-w-7xl px-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-10 transition-colors">
          <ArrowLeft size={16} /> Back to Apothecary
        </Link>
        
        {/* 1. Hero Section */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="sticky top-32 rounded-[32px] border border-border bg-muted/20 overflow-hidden relative aspect-square shadow-sm flex items-center justify-center p-12 h-fit">
            <button className="absolute top-6 right-6 p-3 bg-background/80 backdrop-blur-md rounded-full border border-border shadow-sm hover:text-[var(--vx-coral)] transition-colors z-10">
              <Heart size={20} />
            </button>
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl scale-105"
            />
          </div>

          <div className="flex flex-col justify-center py-6">
            <span className="inline-flex text-xs uppercase tracking-widest text-background bg-foreground font-bold px-3 py-1 rounded-full w-fit mb-6 shadow-sm">
              {product.category}
            </span>
            <h1 className="font-display text-5xl font-semibold md:text-6xl leading-tight mb-4 tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < Math.floor(product.rating) ? "fill-[var(--vx-jade)] text-[var(--vx-jade)]" : "text-muted-foreground/30"} />
                ))}
              </div>
              <span className="text-base font-semibold">{product.rating}</span>
              <span className="text-base text-muted-foreground underline decoration-border underline-offset-4 cursor-pointer hover:text-foreground transition-colors">
                {product.reviewCount} reviews
              </span>
            </div>
            
            <div className="text-4xl font-display font-medium mb-6">
              ${(product.priceCents / 100).toFixed(2)}
              {product.recurring && <span className="text-lg text-muted-foreground ml-2 font-normal">/ month</span>}
            </div>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed font-light">
              {product.description}
            </p>

            <ul className="space-y-4 mb-10 text-sm font-medium">
              <li className="flex gap-4 items-center"><ShieldCheck size={20} className="text-[var(--vx-jade)]" /> Third-party lab tested for absolute purity</li>
              <li className="flex gap-4 items-center"><Stethoscope size={20} className="text-[var(--vx-jade)]" /> Formulated by elite longevity physicians</li>
              <li className="flex gap-4 items-center"><Check size={20} className="text-[var(--vx-jade)]" /> Ships immediately • Free standard delivery</li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center justify-between border border-border rounded-xl px-4 h-14 bg-background w-full sm:w-32 shrink-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl text-muted-foreground hover:text-foreground w-8 h-8 flex items-center justify-center">−</button>
                <span className="font-semibold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-xl text-muted-foreground hover:text-foreground w-8 h-8 flex items-center justify-center">+</button>
              </div>
              <button 
                onClick={handleAdd}
                disabled={adding}
                className="btn btn-outline flex-1 justify-center text-base h-14 shadow-sm"
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
            </div>
            <button 
                onClick={handleBuyNow}
                disabled={buying}
                className="btn btn-primary w-full justify-center text-base h-14 shadow-[0_10px_40px_-10px_var(--vx-jade)] hover:shadow-[0_20px_60px_-15px_var(--vx-jade)] transition-shadow"
              >
                {buying ? "Processing..." : "Buy Now"}
            </button>
          </div>
        </div>

        <div className="mt-32 max-w-4xl mx-auto space-y-32">
          
          {/* 2. Benefits */}
          <section>
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl font-semibold mb-4 tracking-tight">Core Benefits</h2>
              <p className="text-lg text-muted-foreground">Formulated to directly influence your biomarkers.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {product.benefits?.map((benefit, i) => (
                <div key={i} className="flex gap-5 items-start bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-[var(--vx-jade)]/10 p-3 rounded-2xl shrink-0 text-[var(--vx-jade)]">
                    <Check size={24} />
                  </div>
                  <div className="pt-1">
                    <h4 className="text-lg font-semibold mb-1">{benefit}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. About & Science */}
          <section className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-semibold mb-6 tracking-tight">The Science</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {product.clinicalResearch || "Rigorous clinical trials support the efficacy of this formulation."}
              </p>
              <div className="flex gap-4">
                <span className="inline-flex items-center gap-2 text-sm font-medium bg-muted/50 px-4 py-2 rounded-full"><FlaskConical size={16}/> Clinically Dosed</span>
                <span className="inline-flex items-center gap-2 text-sm font-medium bg-muted/50 px-4 py-2 rounded-full"><ShieldCheck size={16}/> GMP Certified</span>
              </div>
            </div>
            <div className="bg-muted/30 p-10 rounded-[32px] border border-border/50">
              <h3 className="text-xl font-semibold mb-6">Who Should Use This?</h3>
              <div className="flex flex-wrap gap-3">
                {product.whoShouldUse?.map((tag, i) => (
                  <span key={i} className="px-4 py-2 bg-background border border-border rounded-full text-sm font-medium shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Ingredients & Usage */}
          <section className="border-t border-border pt-24">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h2 className="font-display text-3xl font-semibold mb-8 tracking-tight">Active Ingredients</h2>
                <ul className="space-y-4">
                  {product.ingredients?.map((ingredient, i) => (
                    <li key={i} className="p-5 border border-border rounded-2xl bg-card flex items-start gap-4">
                      <Droplet size={20} className="text-[var(--vx-jade)] shrink-0 mt-0.5" />
                      <span className="font-medium">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-3xl font-semibold mb-8 tracking-tight">How To Use</h2>
                <div className="p-8 bg-[var(--vx-ink)] text-white rounded-[32px] shadow-xl">
                  <p className="text-lg leading-relaxed text-white/90">
                    {product.howToUse || "Follow the instructions on the packaging for optimal results."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. FAQ */}
          {product.faqs && product.faqs.length > 0 && (
            <section className="border-t border-border pt-24 max-w-3xl mx-auto">
              <h2 className="font-display text-4xl font-semibold mb-12 text-center tracking-tight">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {product.faqs.map((faq, i) => (
                  <div key={i} className="border border-border rounded-2xl bg-card overflow-hidden transition-all">
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between font-medium text-lg hover:bg-muted/30 transition-colors"
                    >
                      {faq.question}
                      <ChevronDown className={`transform transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <section className="border-t border-border pt-24">
              <h2 className="font-display text-4xl font-semibold mb-12 text-center tracking-tight">Customer Reviews</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {product.reviews.map((review) => (
                  <div key={review.id} className="p-8 border border-border rounded-3xl bg-card shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{review.author}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={i < review.rating ? "fill-[var(--vx-jade)] text-[var(--vx-jade)]" : "text-muted-foreground/30"} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      "{review.content}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* 7. Related Products */}
        <div className="mt-32 border-t border-border pt-24 mb-10">
          <h2 className="font-display text-3xl font-semibold text-center mb-12 tracking-tight">Frequently Bought Together</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {Object.values(PRODUCTS)
              .filter(p => p.id !== product.id)
              .slice(0, 3)
              .map(p => (
                <Link key={p.id} href={`/products/${p.id}`} className="group block border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card">
                  <div className="aspect-[4/3] bg-muted/20 p-8 flex items-center justify-center">
                    <img src={p.image} alt={p.name} className="h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500 ease-out" />
                  </div>
                  <div className="p-6 border-t border-border">
                    <h4 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-[var(--vx-jade)] transition-colors">{p.name}</h4>
                    <p className="text-muted-foreground font-medium">${(p.priceCents / 100).toFixed(2)}</p>
                  </div>
                </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
