"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export type CartItem = {
  id: string;
  name: string;
  priceCents: number;
  recurring: boolean;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotalCents: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const skipSync = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      const localRaw = localStorage.getItem("vx_cart");
      let localItems: CartItem[] = [];
      if (localRaw) {
        try {
          localItems = JSON.parse(localRaw);
        } catch (e) {}
      }

      if (currentUser) {
        // Fetch from DB
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            const dbItems: CartItem[] = Array.isArray(data.cart) ? data.cart : [];
            
            // Merge logic: prioritize localItems if they exist (added while logged out)
            const merged = [...dbItems];
            let changed = false;
            localItems.forEach(li => {
              const idx = merged.findIndex(mi => mi.id === li.id);
              if (idx >= 0) {
                merged[idx].quantity += li.quantity;
              } else {
                merged.push(li);
              }
              changed = true;
            });

            setItems(merged);
            
            if (changed) {
              // Save merged to DB immediately
              await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cart: merged })
              });
              // Clear local storage so we don't merge again
              localStorage.removeItem("vx_cart");
            }
          }
        } catch (e) {
          console.error("Failed to sync cart", e);
          setItems(localItems);
        }
      } else {
        setItems(localItems);
      }
      
      setHydrated(true);
    };

    init();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // Fetch fresh cart state on login instead of reloading the page to prevent infinite loops
        init();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setItems([]);
        localStorage.removeItem("vx_cart");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    
    // Skip the first sync to DB if it's just the initial render of the fetched items
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }

    if (user) {
      // Sync to DB
      const debounce = setTimeout(() => {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: items })
        }).catch(console.error);
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      // Sync to local storage
      localStorage.setItem("vx_cart", JSON.stringify(items));
    }
  }, [items, hydrated, user]);

  const value: CartCtx = {
    items,
    add: (item, qty = 1) =>
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === item.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
          return copy;
        }
        return [...prev, { ...item, quantity: qty }];
      }),
    remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
    setQty: (id, qty) =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))),
    clear: () => setItems([]),
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotalCents: items.reduce((s, i) => s + i.priceCents * i.quantity, 0),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}
