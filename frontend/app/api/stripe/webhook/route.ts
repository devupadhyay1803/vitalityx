import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
 const sig = req.headers.get("stripe-signature");
 const buf = Buffer.from(await req.arrayBuffer());
 const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

 let event: Stripe.Event;
 try {
 if (secret && sig) {
 event = stripe.webhooks.constructEvent(buf, sig, secret);
 } else {
 // Dev/preview: trust body without signature verification
 event = JSON.parse(buf.toString()) as Stripe.Event;
 console.warn("[webhook] STRIPE_WEBHOOK_SECRET not configured — skipping signature verification");
 }
 } catch (err: any) {
 console.error("[webhook] signature failure", err.message);
 return NextResponse.json({ error: "Bad signature" }, { status: 400 });
 }

 const admin = createAdminClient();

 if (event.type === "checkout.session.completed") {
 const session = event.data.object as Stripe.Checkout.Session;
 const member_id = session.metadata?.member_id !== "guest" ? session.metadata?.member_id : null;

 // Mark order paid
 const { data: order } = await admin
 .from("orders")
 .update({ status: "paid", amount_total: session.amount_total || 0 })
 .eq("stripe_session_id", session.id)
 .select()
 .single();

 // Recurring → create subscription rows
 if (session.mode === "subscription" && session.subscription && member_id) {
 const sub = await stripe.subscriptions.retrieve(session.subscription as string, { expand: ["items.data.price.product"] });
 for (const it of sub.items.data) {
 const product = it.price.product as Stripe.Product;
 await admin.from("supplement_subscriptions").insert({
 member_id,
 stripe_subscription_id: sub.id,
 product_name: product.name,
 status: "active",
 });
 }
 }

 // Confirmation email
 if (session.customer_email) {
 const itemsList = (order?.items || []).map((i: any) => `<li>${i.name} × ${i.quantity}</li>`).join("");
 await sendEmail({
 to: session.customer_email,
 subject: "Your VitalityX order is confirmed",
 html: `<div style="font-family:Georgia,serif;color:#1a1a2e">
 <h2>Order confirmed</h2>
 <p>Thanks for joining the stack. Your shipment will go out within 2 business days.</p>
 <ul>${itemsList}</ul>
 <p style="margin-top:24px">Total: <strong>$${((session.amount_total || 0)/100).toFixed(2)}</strong></p>
 </div>`,
 });
 }
 }

 return NextResponse.json({ received: true });
}
