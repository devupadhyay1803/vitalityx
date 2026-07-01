"use client";
import useSWR from "swr";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/portal/user-provider";

const supabase = createClient();
const tabs = ["Biomarkers", "Genetics", "Bio Age"] as const;
type Tab = typeof tabs[number];

export default function MyDataPage() {
  const [tab, setTab] = useState<Tab>("Biomarkers");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      
      const ext = file.name.split('.').pop();
      const storagePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file);
        
      if (storageError) throw storageError;
      
      const { error: dbError } = await supabase.from("documents").insert({
        member_id: user.id,
        uploaded_by: user.id,
        category: "Lab Report",
        title: file.name.split('.')[0].replace(/[-_]/g, ' '),
        description: "Uploaded from My Data page",
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type || "application/octet-stream",
        file_size: file.size
      });
      
      if (dbError) throw dbError;
      
      alert("Labs uploaded successfully. Our clinical team will review them within 48 hours.");
      // Typically we'd use mutate("member-documents") here to refresh the UI
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="member-data-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="font-display text-4xl font-medium">My Data</h1>
        <div className="flex items-center gap-3">
          <label className="btn btn-outline cursor-pointer whitespace-nowrap">
            {uploading ? "Uploading..." : "Upload Past Labs"}
            <input type="file" accept=".pdf,.csv" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          <a href="/supplements/dna-methylation-kit" className="btn btn-jade whitespace-nowrap">
            Order Retest Kit
          </a>
        </div>
      </div>
      <div className="mt-6 flex gap-2 border-b border-border">
        {tabs.map((t) => (
          <button key={t} data-testid={`data-tab-${t.toLowerCase().replace(" ","-")}`} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm transition ${tab===t?"border-b-2 border-[var(--vx-ink)] font-medium":"text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "Biomarkers" && <BiomarkersTable />}
        {tab === "Genetics" && <GeneticsList />}
        {tab === "Bio Age" && <BioAgeTrend />}
      </div>
    </div>
  );
}

function BiomarkersTable() {
  const { user } = useUser();
  const { data } = useSWR(["biomarkers", user.id], async () => {
    const { data } = await supabase.from("biomarkers").select("*").eq("member_id", user.id).order("tested_at", { ascending: false });
    return data || [];
  });
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data.length) return <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No biomarkers yet.</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full" data-testid="biomarkers-table">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
          <tr><th className="p-3">Marker</th><th className="p-3">Value</th><th className="p-3">Target</th><th className="p-3">Status</th><th className="p-3">Tested</th></tr>
        </thead>
        <tbody>
          {data.map((b: any) => (
            <tr key={b.id} className="border-t border-border text-sm">
              <td className="p-3">{b.name}</td>
              <td className="p-3 font-mono">{b.value} {b.unit}</td>
              <td className="p-3 text-muted-foreground">{b.target_min}–{b.target_max}</td>
              <td className="p-3"><span className={`badge ${b.status==="optimal"?"badge-jade":b.status==="borderline"?"badge-amber":"badge-coral"}`}>{b.status}</span></td>
              <td className="p-3 text-muted-foreground">{b.tested_at || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function GeneticsList() {
  const { user } = useUser();
  const { data } = useSWR(["genetics", user.id], async () => {
    const { data } = await supabase.from("genetic_traits").select("*").eq("member_id", user.id);
    return data || [];
  });
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data.length) return <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No genetic data uploaded. <a href="/gina" className="underline">Learn about GINA protection.</a></p>;
  return (
    <ul className="space-y-3" data-testid="genetics-list">
      {data.map((g: any) => (
        <li key={g.id} className="vx-card p-4">
          <div className="flex items-center justify-between"><span className="font-medium">{g.trait_name}</span><span className={`badge ${g.impact==="positive"?"badge-jade":g.impact==="risk"?"badge-coral":"badge-ink"}`}>{g.impact}</span></div>
          <p className="mt-1 text-xs text-muted-foreground">Variant: {g.variant}</p>
          <p className="mt-2 text-sm">{g.plain_language_summary}</p>
        </li>
      ))}
    </ul>
  );
}
function BioAgeTrend() {
  const { user } = useUser();
  const { data } = useSWR(["bioage", user.id], async () => {
    const { data } = await supabase.from("biological_age_records").select("*").eq("member_id", user.id).order("calculated_at", { ascending: true });
    return data || [];
  });
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data.length) return <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">First lab pending.</p>;
  const latest = data[data.length-1];
  return (
    <div className="vx-card p-6" data-testid="bio-age-card">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Latest biological age</p>
      <p className="mt-2 font-display text-5xl">{latest.biological_age != null ? `${latest.biological_age} yrs` : "—"}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Calculated {new Date(latest.calculated_at).toLocaleDateString()}
      </p>
    </div>
  );
}
