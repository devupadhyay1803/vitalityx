"use client";
import { useCart } from "@/components/cart/cart-provider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Box, CalendarClock } from "lucide-react";
import Link from "next/link";
import { PROGRAMS } from "@/lib/programs";
import { PRODUCTS } from "@/lib/products";
import Image from "next/image";

export default function CartPage() {
  const router = useRouter();
  const { items, remove, setQty, subtotalCents, count } = useCart();
  const [busy, setBusy] = useState(false);

  async function checkout() {
    if (count === 0) return toast.error("Cart is empty");
    setBusy(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(i => ({ id: i.id, quantity: i.quantity })), origin: window.location.origin }),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok || !j.url) return toast.error(j.error || "Checkout failed");
    window.location.href = j.url;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16" data-testid="cart-page">
      <h1 className="font-display text-4xl font-medium mb-10">Your cart</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-[24px] border border-dashed border-border bg-card/50 p-16 flex flex-col items-center justify-center text-center">
          <Box size={48} className="text-muted-foreground/30 mb-6" />
          <h3 className="font-display text-2xl font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-8">Ready to optimize your biology?</p>
          <div className="flex gap-4">
            <Link href="/products" className="btn btn-primary">Browse Apothecary</Link>
            <Link href="/programs" className="btn btn-outline">Explore Programs</Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="space-y-4" data-testid="cart-items">
            {items.map((i) => {
              const isProgram = !!PROGRAMS[i.id];
              const product = PRODUCTS[i.id];
              return (
                <li key={i.id} className="vx-card p-6 border border-border shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    {/* Visual Identifier */}
                    <div className="w-16 h-16 rounded-xl bg-muted/40 flex items-center justify-center border border-border shrink-0 overflow-hidden relative">
                      {isProgram ? <CalendarClock className="text-[var(--vx-jade)]" /> : (
                        product?.image ? <Image src={product.image} alt={i.name} fill className="object-cover" sizes="64px" /> : <Box className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg">{i.name}</p>
                        {isProgram && <span className="bg-[var(--vx-jade)]/10 text-[var(--vx-jade)] px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">Program</span>}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        ${(i.priceCents/100).toFixed(2)} {i.recurring ? <span className="text-xs uppercase tracking-widest ml-1">/ month</span> : ""}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {isProgram ? (
                      <span className="text-sm font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border">Qty: 1 (Fixed)</span>
                    ) : (
                      <input 
                        data-testid={`cart-qty-${i.id}`} 
                        type="number" 
                        min={1} 
                        value={i.quantity} 
                        onChange={(e) => setQty(i.id, Number(e.target.value))} 
                        className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm font-medium shadow-sm focus:ring-2 focus:ring-[var(--vx-jade)] outline-none" 
                      />
                    )}
                    <button 
                      data-testid={`cart-remove-${i.id}`} 
                      onClick={() => remove(i.id)} 
                      className="rounded-full p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          
          <div className="mt-12 bg-card border border-border rounded-[24px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4 text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium">${(subtotalCents/100).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-6 text-muted-foreground">
              <span>Taxes & Shipping</span>
              <span className="text-sm italic">Calculated at checkout</span>
            </div>
            
            <div className="flex items-center justify-between border-t border-border pt-6 mb-8">
              <span className="font-display text-xl font-semibold">Total</span>
              <span data-testid="cart-subtotal" className="font-display text-4xl font-semibold">${(subtotalCents/100).toFixed(2)}</span>
            </div>
            
            <button 
              data-testid="cart-checkout-btn" 
              onClick={checkout} 
              disabled={busy} 
              className="btn btn-primary w-full h-14 justify-center text-lg shadow-md"
            >
              {busy ? "Securing Session…" : "Proceed to Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
