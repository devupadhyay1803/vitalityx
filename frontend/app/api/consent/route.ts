import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";
import { CONSENT_VERSION, CONSENT_TEXT } from "@/lib/consent";

export async function GET(req: NextRequest) {
 try {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { data, error } = await supabase
 .from("consent_records")
 .select("consent_version")
 .eq("user_id", user.id)
 .eq("consent_version", CONSENT_VERSION)
 .order("accepted_at", { ascending: false })
 .limit(1)
 .single();

 if (error && error.code !== 'PGRST116') {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }

 return NextResponse.json({ hasConsented: !!data });
 } catch (error: unknown) {
 return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 try {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
 const userAgent = req.headers.get("user-agent") || "unknown";

 // Ensure profile exists (in case the DB trigger failed or was removed)
 await supabase.from("profiles").upsert({
   id: user.id,
   email: user.email,
   full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Member",
   role: user.user_metadata?.role || "Member"
 }, { onConflict: "id" });

 // Ensure client_record exists
 await supabase.from("client_records").upsert({
    member_id: user.id,
    consented: true,
    consented_at: new Date().toISOString(),
    consent_version: CONSENT_VERSION
  }, { onConflict: "member_id" });

 const { error } = await supabase.from("consent_records").insert({
 user_id: user.id,
 consent_version: CONSENT_VERSION,
 consent_text: CONSENT_TEXT,
 ip_address: ipAddress,
 user_agent: userAgent
 });

 if (error) {
 console.error(error);
 return NextResponse.json({ error: "Failed to record consent" }, { status: 500 });
 }

 const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

 await logAudit({
 actorId: user.id,
 actorRole: profile?.role || "Member",
 action: "Consent accepted",
 resourceType: "consent",
 metadata: { consent_version: CONSENT_VERSION },
 });

 await createNotification({
 userId: user.id,
 title: "Consent Signed",
 message: `You have successfully signed version ${CONSENT_VERSION} of our consent forms.`,
 type: "consent_required",
 category: "consent",
 link: "/member/labs"
 });

 return NextResponse.json({ success: true, message: "Consent recorded" });
 } catch (error: unknown) {
 return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
 }
}
