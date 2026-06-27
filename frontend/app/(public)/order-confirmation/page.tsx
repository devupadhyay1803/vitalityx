"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import Link from "next/link";

function Confirmation() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    async function poll() {
      const res = await fetch(`/api/orders/by-session?session_id=${sessionId}`);
      const j = await res.json();
      if (cancelled) return;
      if (res.ok) {
        setOrder(j);
        if (j.status === "paid") clear();
        if (j.status !== "paid" && tries < 5) setTimeout(() => setTries((t) => t + 1), 2000);
      } else if (tries < 5) setTimeout(() => setTries((t) => t + 1), 2000);
    }
    poll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, tries]);

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center" data-testid="order-confirmation">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--vx-jade)]/20 text-3xl">✓</div>
      <h1 className="mt-6 font-display text-4xl font-medium">Order confirmed</h1>
      <p className="mt-3 text-muted-foreground">Thanks for joining the stack. Your shipment will go out within 2 business days.</p>
      {order && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-left">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Order summary</p>
          <ul className="mt-3 space-y-2 text-sm">
            {(order.items || []).map((it: any, i: number) => (
              <li key={i} className="flex justify-between"><span>{it.name} × {it.quantity}</span><span>${((it.amount * it.quantity)/100).toFixed(2)}</span></li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm font-medium">
            <span>Total</span><span>${((order.amount_total || 0)/100).toFixed(2)}</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Status: <span className="badge badge-jade">{order.status}</span></p>
        </div>
      )}
      <Link href="/member/dashboard" className="btn btn-primary mt-8">Go to dashboard</Link>
    </div>
  );
}

export default function ConfirmationPage() {
  return <Suspense fallback={<div className="p-10 text-center">Loading…</div>}><Confirmation /></Suspense>;
}
