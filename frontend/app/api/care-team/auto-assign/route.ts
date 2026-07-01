import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
 try {
 // 1. Authenticate user using the server client (reads session cookies)
 const supabase = await createServerClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 // 2. Fetch user's profile to make sure they are a Member
 const { data: profile, error: profileErr } = await supabase
 .from("profiles")
 .select("role")
 .eq("id", user.id)
 .single();
 
 if (profileErr || !profile || profile.role !== "Member") {
 return NextResponse.json({ error: "Only members can auto-assign care teams" }, { status: 403 });
 }

 // 3. Create the service role admin client to perform RLS-bypassed updates
 const adminSupabase = createSupabaseClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!,
 { auth: { persistSession: false } }
 );

 // 4. Check if the user already has care team assignments
 const { data: existingAssignments, error: assignmentsErr } = await adminSupabase
 .from("care_team_assignments")
 .select("id")
 .eq("member_id", user.id);
 
 if (assignmentsErr) {
 return NextResponse.json({ error: assignmentsErr.message }, { status: 500 });
 }

 if (existingAssignments && existingAssignments.length > 0) {
 return NextResponse.json({ success: true, message: "Care team already assigned" });
 }

 // 5. If they have no assignments, let's find the default coach from client_records
 const { data: clientRec } = await adminSupabase
 .from("client_records")
 .select("assigned_coach_id")
 .eq("member_id", user.id)
 .single();
 
 let coachId = clientRec?.assigned_coach_id;

 // Fallback: If no coach is assigned in client_records, fetch the first available Coach from profiles
 if (!coachId) {
 const { data: coaches } = await adminSupabase
 .from("profiles")
 .select("id")
 .eq("role", "Coach")
 .limit(1);
 coachId = coaches?.[0]?.id;
 }

 if (!coachId) {
 return NextResponse.json({ error: "No available coaches found to assign" }, { status: 404 });
 }

 // 6. We assign this Coach as their primary health coach
 const { error: insertErr } = await adminSupabase
 .from("care_team_assignments")
 .insert({
 member_id: user.id,
 staff_id: coachId,
 role: "Health Coach",
 is_primary: true
 });
 
 if (insertErr) {
 return NextResponse.json({ error: insertErr.message }, { status: 500 });
 }

 // Optionally assign other staff members (e.g. physician, nutritionist) if they exist
 const { data: otherStaff } = await adminSupabase
 .from("profiles")
 .select("id, full_name")
 .eq("role", "Coach")
 .neq("id", coachId)
 .limit(2);
 
 if (otherStaff && otherStaff.length > 0) {
 const roles = ["Physician", "Nutritionist"];
 const assignmentsToInsert = otherStaff.map((staff, idx) => ({
 member_id: user.id,
 staff_id: staff.id,
 role: roles[idx] || "Nutritionist",
 is_primary: false
 }));

 await adminSupabase.from("care_team_assignments").insert(assignmentsToInsert);
 }

 return NextResponse.json({ success: true, message: "Care team assigned successfully" });
 } catch (error: unknown) {
 return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
 }
}
