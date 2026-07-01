"use client";
import { use, useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ClientTabs } from "@/components/staff/client-tabs";

const supabase = createClient();

export default function LabsPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = use(params);
 const { data, error, isLoading, mutate } = useSWR(`labs-${id}`, async () => {
 const { data: labs, error } = await supabase.from("lab_results").select("*").eq("member_id", id).order("tested_at", { ascending: false });
 if (error) throw error;
 return labs || [];
 });
 const [bioAge, setBioAge] = useState("");
 const [testedAt, setTestedAt] = useState("");
 const [name, setName] = useState("");
 const [value, setValue] = useState("");
 const [unit, setUnit] = useState("");
 const [status, setStatus] = useState<"optimal"|"borderline"|"elevated">("optimal");

 async function uploadLab() {
 const { data: { user } } = await supabase.auth.getUser();
 const { error } = await supabase.from("lab_results").insert({
 member_id: id, biological_age: bioAge ? Number(bioAge) : null, tested_at: testedAt || null,
 uploaded_by: user!.id,
 });
 if (error) return toast.error(error.message);
 toast.success("Lab record saved");
 setBioAge(""); setTestedAt("");
 mutate();
 }

 async function addBiomarker() {
 const { error } = await supabase.from("biomarkers").insert({
 member_id: id, name, value: value ? Number(value) : null, unit, status, tested_at: testedAt || null,
 });
 if (error) return toast.error(error.message);
 toast.success("Biomarker added");
 
 // Trigger recalculation asynchronously in background
 fetch("/api/bio-age/trigger", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ member_id: id })
 }).catch(e => console.error("Recalculation error:", e));

 setName(""); setValue(""); setUnit("");
 }

 return (
 <div className="mx-auto max-w-3xl px-6 py-10" data-testid="staff-labs-page">
 <h1 className="font-display text-4xl font-medium">Labs</h1>

 <ClientTabs id={id} />

 <div className="mt-6 vx-card p-6 space-y-3">
 <p className="font-medium">Record biological age</p>
 <p className="text-xs text-muted-foreground mb-2">Note: To upload the actual Lab Report PDF, please use the <a href={`/staff/clients/${id}/documents`} className="underline text-[var(--vx-jade)]">Documents tab</a>.</p>
 <input data-testid="lab-tested-at" type="date" value={testedAt} onChange={(e) => setTestedAt(e.target.value)} className="vx-input" />
 <input data-testid="lab-bio-age" type="number" step="0.1" value={bioAge} onChange={(e) => setBioAge(e.target.value)} placeholder="Biological age (yrs)" className="vx-input" />
 <button data-testid="lab-upload" onClick={uploadLab} className="btn btn-primary">Save record</button>
 </div>

 <div className="mt-6 vx-card p-6 space-y-3">
 <p className="font-medium">Add biomarker manually</p>
 <input data-testid="bm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Marker name (e.g. ApoB)" className="vx-input" />
 <div className="flex gap-2">
 <input data-testid="bm-value" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className="vx-input flex-1" />
 <input data-testid="bm-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit (mg/dL)" className="vx-input flex-1" />
 </div>
 <select data-testid="bm-status" value={status} onChange={(e) => setStatus(e.target.value as any)} className="vx-input">
 <option value="optimal">Optimal</option><option value="borderline">Borderline</option><option value="elevated">Elevated</option>
 </select>
 <button data-testid="bm-add" onClick={addBiomarker} className="btn btn-outline">Add biomarker</button>
 </div>

 <h2 className="mt-10 font-display text-xl">Recent labs</h2>
 {isLoading ? (
 <div className="mt-3 h-16 w-full bg-muted rounded-xl animate-pulse"></div>
 ) : error ? (
 <div className="mt-3 p-4 text-center">
 <p className="text-destructive text-sm">Failed to load labs.</p>
 <button onClick={() => mutate()} className="mt-2 btn btn-outline text-xs">Try again</button>
 </div>
 ) : !data || data.length === 0 ? (
 <p className="mt-3 text-sm text-muted-foreground rounded-lg border border-dashed p-4 text-center">No labs recorded yet.</p>
 ) : (
 <ul className="mt-3 space-y-2">
 {data.map((l: any) => (
 <li key={l.id} className="vx-card p-3 text-sm flex justify-between">
 <span>Tested {l.tested_at} · Bio age {l.biological_age ?? "—"}</span>
 </li>
 ))}
 </ul>
 )}
 </div>
 );
}
