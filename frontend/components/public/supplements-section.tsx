"use client";
import { useCart } from "@/components/cart/cart-provider";
import { toast } from "sonner";
import { PRODUCTS } from "@/lib/products";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function SupplementsSection() {
  const { add } = useCart();
  const list = Object.values(PRODUCTS);

  return (
    <section id="supplements" className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">Featured Products</p>
        <h2 className="mt-3 text-center font-display text-4xl font-medium leading-tight md:text-5xl">
          Optimized Stacks &amp; Diagnostic Assays
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Our daily protocols leverage clinical-grade stacked supplements and diagnostics.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {list.map((p) => (
            <div key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-xl" data-testid={`supplement-${p.id}`}>
              <div className="aspect-square overflow-hidden bg-muted relative">
                <Image src={p.image} alt={p.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="badge badge-jade">{p.category}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Star size={12} className="fill-current text-amber-500" />
                    {p.rating.toFixed(1)} ({p.reviewCount})
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-display text-2xl">${(p.priceCents/100).toFixed(2)}</span>
                  <button
                    data-testid={`add-to-cart-${p.id}`}
                    onClick={() => {
                      add({ id: p.id, name: p.name, priceCents: p.priceCents, recurring: p.recurring });
                      toast.success(`${p.name} added`);
                    }}
                    className="btn btn-primary text-sm"
                  >
                    Add to Stack <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/cart" className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">
            Shop All Diagnostics &amp; Compounds <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
