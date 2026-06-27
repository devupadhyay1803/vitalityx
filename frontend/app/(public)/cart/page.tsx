"use client";
import { useCart } from "@/components/cart/cart-provider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import Link from "next/link";

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
    <div className="mx-auto max-w-3xl px-6 py-12" data-testid="cart-page">
      <h1 className="font-display text-4xl font-medium">Your cart</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Cart is empty. <Link href="/#supplements" className="underline">Browse supplements →</Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-3" data-testid="cart-items">
            {items.map((i) => (
              <li key={i.id} className="vx-card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">${(i.priceCents/100).toFixed(2)} {i.recurring ? "/mo" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input data-testid={`cart-qty-${i.id}`} type="number" min={1} value={i.quantity} onChange={(e) => setQty(i.id, Number(e.target.value))} className="w-16 rounded-md border border-border px-2 py-1 text-center text-sm" />
                  <button data-testid={`cart-remove-${i.id}`} onClick={() => remove(i.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p data-testid="cart-subtotal" className="font-display text-3xl">${(subtotalCents/100).toFixed(2)}</p>
            </div>
            <button data-testid="cart-checkout-btn" onClick={checkout} disabled={busy} className="btn btn-primary">
              {busy ? "Redirecting…" : "Checkout →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
