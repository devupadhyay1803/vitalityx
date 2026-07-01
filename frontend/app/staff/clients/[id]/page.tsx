import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientTabs } from "@/components/staff/client-tabs";
import { ClipboardList } from "lucide-react";

function formatIntake(intake: any, consentedAt?: string) {
 if (!intake || Object.keys(intake).length === 0) return null;

 const fields: { label: string; value: string }[] = [];

 // 1. Goal / Primary Objective
 const goalVal = intake.goals || intake.goal || intake.health_goal;
 if (goalVal) {
 fields.push({ label: "Goal / Primary Objective", value: String(goalVal) });
 }

 // 2. Medical Conditions
 if (intake.conditions && Array.isArray(intake.conditions)) {
 const condList = intake.conditions.filter((c: string) => c !== "None");
 if (condList.length > 0) {
 fields.push({ label: "Medical Conditions", value: condList.join(", ") });
 } else if (intake.conditions.includes("None")) {
 fields.push({ label: "Medical Conditions", value: "None" });
 }
 } else if (intake.conditions) {
 fields.push({ label: "Medical Conditions", value: String(intake.conditions) });
 }

 // 3. Medications
 if (intake.medications && String(intake.medications).toLowerCase() !== "none") {
 fields.push({ label: "Current Medications", value: String(intake.medications) });
 }

 // 4. Allergies
 if (intake.allergies && String(intake.allergies).toLowerCase() !== "none") {
 fields.push({ label: "Allergies", value: String(intake.allergies) });
 }

 // 5. Activity Level / Exercise
 if (intake.activity_level) {
 fields.push({ label: "Activity Level", value: String(intake.activity_level) });
 } else if (intake.exercise_days !== undefined && intake.exercise_days !== null) {
 fields.push({ label: "Exercise days / week", value: `${intake.exercise_days} days` });
 }

 // 6. Sleep hours
 if (intake.sleep_hours !== undefined && intake.sleep_hours !== null) {
 fields.push({ label: "Sleep hours / night", value: `${intake.sleep_hours} hours` });
 }

 // 7. Smoking
 if (intake.smoking) {
 fields.push({ label: "Smoking", value: String(intake.smoking) });
 }

 // 8. Alcohol
 if (intake.alcohol) {
 fields.push({ label: "Alcohol", value: String(intake.alcohol) });
 }

 // 9. Completed On
 if (consentedAt) {
 fields.push({ label: "Completed On", value: new Date(consentedAt).toLocaleDateString() });
 }

 return fields.length > 0 ? fields : null;
}

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return null;

 // Access log (using admin client to bypass RLS on logs)
 const admin = createAdminClient();
 await admin.from("staff_access_logs").insert({ staff_id: user.id, member_id: id, resource_type: "client_overview" });

 const [{ data: profile }, { data: cr }, { data: items }, { data: biomarkers }, { data: labs }, { data: bioRecords }, { data: careTeam }] = await Promise.all([
 supabase.from("profiles").select("*").eq("id", id).single(),
 supabase.from("client_records").select("*").eq("member_id", id).single(),
 supabase.from("protocol_items").select("*").eq("member_id", id).eq("active", true),
 supabase.from("biomarkers").select("*").eq("member_id", id).order("tested_at", { ascending: false }).limit(10),
 supabase.from("lab_results").select("*").eq("member_id", id).order("tested_at", { ascending: false }),
 supabase.from("biological_age_records").select("*").eq("member_id", id).order("calculated_at", { ascending: false }).limit(1),
 supabase.from("care_team_assignments").select(`
 id, role,
 staff:profiles!care_team_assignments_staff_id_fkey(
 id, full_name,
 staff_profiles(credentials, profile_photo)
 )
 `).eq("member_id", id)
 ]);

 if (!profile) notFound();

 // Filter out internal fields like private_notes & signature from the intake summary count
 const intakeData = cr?.intake ? { ...cr.intake } : {};
 if (intakeData.private_notes) delete intakeData.private_notes;
 if (intakeData.signature) delete intakeData.signature;
 if (intakeData.signatureName) delete intakeData.signatureName;

 const intakeFields = formatIntake(intakeData, cr?.consented_at || cr?.created_at);

 return (
 <div className="mx-auto max-w-5xl px-6 py-10" data-testid="staff-client-detail">
 <h1 className="font-display text-4xl font-medium">{profile.full_name}</h1>
 <p className="mt-2 text-muted-foreground">{profile.email} · Goal: {profile.health_goal || "—"}</p>

 <ClientTabs id={id} />

 <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <Card title="Intake">
 {intakeFields ? (
 <div className="space-y-3">
 {intakeFields.map((f, idx) => (
 <div key={idx} className="flex flex-col border-b border-border/30 pb-2 last:border-0 last:pb-0">
 <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</span>
 <span className="text-sm font-medium mt-0.5 text-foreground">{f.value}</span>
 </div>
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground" data-testid="intake-empty-state">
 <ClipboardList size={28} className="text-muted-foreground/60 mb-2" />
 <p className="text-xs">No intake questionnaire has been completed yet.</p>
 </div>
 )}
 </Card>
 <Card title="Consent">{cr?.consented ? <p className="text-sm text-[var(--vx-jade)]">Consented v{cr.consent_version} on {cr.consented_at?.split("T")[0]}</p> : <p className="text-sm text-muted-foreground">Not consented</p>}</Card>
 <Card title="Biological Age Engine">
 {bioRecords && bioRecords.length > 0 ? (
 <div className="space-y-2">
 <div className="flex justify-between items-center"><span className="text-sm">Bio Age</span><span className="font-display text-lg">{bioRecords[0].biological_age != null ? `${bioRecords[0].biological_age} yrs` : "—"}</span></div>
 <div className="flex justify-between items-center"><span className="text-sm">Longevity</span><span className="font-display text-lg">{bioRecords[0].longevity_score != null ? bioRecords[0].longevity_score : "—"}</span></div>
 <div className="flex justify-between items-center"><span className="text-sm">Confidence</span><span className="font-display text-lg">{bioRecords[0].confidence_score != null ? `${bioRecords[0].confidence_score}%` : "—"}</span></div>
 <p className="text-[10px] text-muted-foreground mt-2">Calculated {new Date(bioRecords[0].calculated_at).toLocaleDateString()}</p>
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No bio age computed.</p>
 )}
 </Card>
 <Card title="Care Team">
 {careTeam && careTeam.length > 0 ? (
 <div className="space-y-4 mt-1">
 {careTeam.reduce((acc: any[], current: any) => {
 const staffId = current.staff?.id;
 if (staffId && !acc.find((item: any) => item.staff?.id === staffId)) acc.push(current);
 else if (!staffId) acc.push(current);
 return acc;
 }, []).map((assignment: any) => {
 const staff = assignment.staff;
 if (!staff) return (
 <div key={assignment.id} className="flex items-center gap-3">
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-xs">?</span>
 <div>
 <p className="font-medium text-sm text-muted-foreground">Unavailable</p>
 <p className="text-[10px] text-muted-foreground">{assignment.role}</p>
 </div>
 </div>
 );
 const profile = staff.staff_profiles?.[0] || {};
 return (
 <div key={assignment.id} className="flex items-center gap-3">
 {profile.profile_photo ? (
 <img src={profile.profile_photo} alt={staff.full_name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
 ) : (
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--vx-jade)]/20 font-medium text-[var(--vx-jade)] text-xs">
 {staff.full_name.charAt(0) || "?"}
 </span>
 )}
 <div>
 <p className="font-medium text-sm">{staff.full_name}</p>
 <p className="text-[10px] text-muted-foreground">{assignment.role} {profile.credentials ? `• ${profile.credentials}` : ""}</p>
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No team assigned.</p>
 )}
 </Card>
 </div>

 <h2 className="mt-10 font-display text-xl">Protocol ({items?.length || 0} items)</h2>
 <ul className="mt-3 space-y-2">{items?.map((i: any) => <li key={i.id} className="vx-card p-3 text-sm">{i.title}</li>)}</ul>

 <h2 className="mt-10 font-display text-xl">Recent biomarkers</h2>
 <ul className="mt-3 space-y-2">
 {biomarkers?.map((b: any) => (
 <li key={b.id} className="vx-card flex items-center justify-between p-3 text-sm">
 <span>{b.name}</span><span className="font-mono">{b.value} {b.unit}</span>
 <span className={`badge ${b.status==="optimal"?"badge-jade":b.status==="borderline"?"badge-amber":"badge-coral"}`}>{b.status}</span>
 </li>
 ))}
 {!biomarkers?.length && <p className="text-sm text-muted-foreground">None yet.</p>}
 </ul>

 <h2 className="mt-10 font-display text-xl">Labs ({labs?.length || 0})</h2>
 <ul className="mt-3 space-y-2">
 {labs?.map((l: any) => (
 <li key={l.id} className="vx-card p-3 text-sm">
 <p>Tested {l.tested_at} · Bio age {l.biological_age ?? "—"}</p>
 {l.pdf_url && <a href={l.pdf_url} target="_blank" className="text-xs underline">View PDF</a>}
 </li>
 ))}
 {!labs?.length && <p className="text-sm text-muted-foreground">No labs uploaded.</p>}
 </ul>
 </div>
 );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
 return <div className="vx-card p-6"><p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p><div className="mt-3">{children}</div></div>;
}
