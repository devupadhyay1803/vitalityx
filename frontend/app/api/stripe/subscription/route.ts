import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { subscription_id, stripe_subscription_id, status } = await req.json();
    if (!["paused", "cancelled"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership via RLS-readable row
    const { data: row } = await supabase.from("supplement_subscriptions").select("*").eq("id", subscription_id).single();
    if (!row || row.member_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    if (stripe_subscription_id) {
      if (status === "cancelled") {
        await stripe.subscriptions.cancel(stripe_subscription_id).catch((e) => console.warn("[stripe] cancel failed (mock?):", e.message));
      } else if (status === "paused") {
        await stripe.subscriptions.update(stripe_subscription_id, { pause_collection: { behavior: "void" } }).catch((e) => console.warn("[stripe] pause failed:", e.message));
      }
    }

    const admin = createAdminClient();
    await admin.from("supplement_subscriptions").update({ status }).eq("id", subscription_id);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal" }, { status: 500 });
  }
}
