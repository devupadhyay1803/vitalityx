import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRODUCTS } from "@/lib/products";
import { PROGRAMS } from "@/lib/programs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONSENT_VERSION } from "@/lib/consent";

export async function POST(req: NextRequest) {
  try {
    const { items, origin } = (await req.json()) as { items: { id: string; quantity: number }[]; origin: string };
    if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "No items" }, { status: 400 });

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Checkout service unavailable" }, { status: 503 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Enforce consent for authenticated users
    if (user) {
      const { data: consentRecord } = await supabase
        .from("consent_records")
        .select("consent_version")
        .eq("user_id", user.id)
        .eq("consent_version", CONSENT_VERSION)
        .single();
      
      if (!consentRecord) {
        return NextResponse.json({ error: "Forbidden: You must accept the latest Terms & Consent before proceeding." }, { status: 403 });
      }
    }

    // Build line_items from SERVER-SIDE catalog only
    const line_items = items
      .map((it) => {
        // Find product or program
        const p = PRODUCTS[it.id] || PROGRAMS[it.id];
        if (!p) return null;
 return {
 price_data: {
 currency: "usd",
 product_data: { name: p.name, description: p.description },
 unit_amount: p.priceCents,
 ...(p.recurring ? { recurring: { interval: "month" as const } } : {}),
 },
 quantity: Math.max(1, Math.floor(it.quantity)),
 };
 })
 .filter((x): x is NonNullable<typeof x> => x !== null);

 if (line_items.length === 0) return NextResponse.json({ error: "Invalid items" }, { status: 400 });

 const hasRecurring = line_items.some((li) => li.price_data.recurring);
 const baseOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || "";

 const session = await stripe.checkout.sessions.create({
 mode: hasRecurring ? "subscription" : "payment",
 line_items,
 success_url: `${baseOrigin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
 cancel_url: `${baseOrigin}/cart`,
 customer_email: user?.email,
 metadata: { member_id: user?.id || "guest" },
 ...(hasRecurring ? {} : { payment_method_types: ["card"] }),
 });

 // Insert pending order
 const admin = createAdminClient();
 await admin.from("orders").insert({
 member_id: user?.id || null,
 stripe_session_id: session.id,
 amount_total: line_items.reduce((s, li) => s + li.price_data.unit_amount * li.quantity, 0),
 currency: "usd",
 status: "pending",
 items: line_items.map((li) => ({ name: li.price_data.product_data.name, amount: li.price_data.unit_amount, quantity: li.quantity, recurring: !!li.price_data.recurring })),
 });

 return NextResponse.json({ url: session.url, session_id: session.id });
 } catch (e: any) {
 return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
 }
}
