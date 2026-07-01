import { NextResponse } from "next/server";
import { triggerRecalculation } from "@/lib/biological-age";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
 try {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 
 if (!user) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const body = await req.json();
 const targetMemberId = body.member_id || user.id;

 // Security: Only allow triggering for self unless admin/coach
 if (targetMemberId !== user.id) {
 const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
 if (!profile || (profile.role === 'Member')) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
 }
 }

 const didUpdate = await triggerRecalculation(targetMemberId);
 
 return NextResponse.json({ success: true, updated: didUpdate });
 } catch (err: unknown) {
 console.error("Bio age trigger error:", err);
 return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
 }
}
