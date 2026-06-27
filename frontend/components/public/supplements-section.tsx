"use client";
import { useCart } from "@/components/cart/cart-provider";
import { toast } from "sonner";
import { PRODUCTS } from "@/lib/products";
import { ArrowUpRight } from "lucide-react";

export function SupplementsSection() {
  const { add } = useCart();
  const list = Object.values(PRODUCTS);

  return (
    <section id="supplements" className="border-t border-border bg-[var(--vx-ink)] py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-end gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">The stack</p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
              A short, evidence-led list.<br />No fairy dust.
            </h2>
          </div>
          <p className="text-white/70">
            We don&apos;t sell forty SKUs. The stack is small, the dosing is what the trials used, and it changes when your labs change.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {list.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10" data-testid={`supplement-${p.id}`}>
              <div className="flex items-center justify-between">
                <span className="font-display text-lg">{p.name}</span>
                <span className="text-sm text-white/60">${(p.priceCents/100).toFixed(0)}/mo</span>
              </div>
              <p className="mt-1 text-sm text-white/50">{p.description}</p>
              <button
                data-testid={`add-to-cart-${p.id}`}
                onClick={() => {
                  add({ id: p.id, name: p.name, priceCents: p.priceCents, recurring: p.recurring });
                  toast.success(`${p.name} added to stack`);
                }}
                className="mt-5 inline-flex w-full items-center justify-center gap-1 rounded-full bg-[var(--vx-jade)] px-4 py-2 text-sm font-medium text-[var(--vx-ink)] transition hover:brightness-110"
              >
                Add to Protocol Stack <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
