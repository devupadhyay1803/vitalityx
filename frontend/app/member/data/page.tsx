"use client";
import useSWR from "swr";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/portal/user-provider";

const supabase = createClient();
const tabs = ["Biomarkers", "Genetics", "Bio Age"] as const;
type Tab = typeof tabs[number];

import { PremiumCard } from "@/components/ui/PremiumCard";
import { StatusBadge, StatusType } from "@/components/ui/StatusBadge";
import { ModernEmptyState } from "@/components/dashboard/ModernEmptyState";
import { FileText, Dna, Activity } from "lucide-react";

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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="member-data-page">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">My Data</h1>
          <p className="mt-2 text-muted-foreground text-lg">Your clinical biomarkers, genetics, and biological age.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="btn btn-outline cursor-pointer whitespace-nowrap shadow-sm hover:border-[var(--vx-jade)] transition-colors">
            {uploading ? "Uploading..." : "Upload Past Labs"}
            <input type="file" accept=".pdf,.csv" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          <a href="/products/dna-methylation-kit" className="btn btn-primary whitespace-nowrap shadow-sm">
            Order Retest Kit
          </a>
        </div>
      </div>
      
      <div className="mt-6 flex gap-6 border-b border-border/60">
        {tabs.map((t) => (
          <button 
            key={t} 
            data-testid={`data-tab-${t.toLowerCase().replace(" ","-")}`} 
            onClick={() => setTab(t)}
            className={`pb-4 text-sm font-medium transition-all relative ${
              tab === t ? "text-[var(--vx-ink)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            {tab === t && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--vx-jade)] rounded-t-full" />
            )}
          </button>
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
  const { data, error, isLoading, mutate } = useSWR(["biomarkers", user.id], async () => {
    const { data, error } = await supabase.from("biomarkers").select("*").eq("member_id", user.id).order("tested_at", { ascending: false });
    if (error) throw error;
    return data || [];
  });
  
  if (isLoading) return <div className="h-64 w-full bg-muted/50 rounded-2xl animate-pulse"></div>;
  if (error) return <div className="text-center p-6 text-destructive"><p>Failed to load biomarkers.</p><button onClick={() => mutate()} className="btn btn-outline text-xs mt-2">Try again</button></div>;
  if (!data || !data.length) return (
    <ModernEmptyState 
      icon={<FileText size={32} />}
      title="No Biomarkers Found"
      description="You haven't uploaded any lab results or completed your initial blood panel yet."
    />
  );
  
  return (
    <PremiumCard className="overflow-hidden p-0">
      <table className="w-full text-left border-collapse" data-testid="biomarkers-table">
        <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
          <tr>
            <th className="p-4 font-semibold">Marker</th>
            <th className="p-4 font-semibold">Value</th>
            <th className="p-4 font-semibold">Target</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold">Tested</th>
          </tr>
        </thead>
        <tbody>
          {data.map((b: any, i: number) => {
            const statusMap: Record<string, StatusType> = {
              "optimal": "success",
              "borderline": "warning",
              "out_of_range": "danger",
              "abnormal": "danger"
            };
            return (
              <tr key={b.id} className={`text-sm ${i !== data.length - 1 ? 'border-b border-border/50' : ''} hover:bg-muted/30 transition-colors`}>
                <td className="p-4 font-medium">{b.name}</td>
                <td className="p-4 font-mono">{b.value} <span className="text-muted-foreground ml-1">{b.unit}</span></td>
                <td className="p-4 text-muted-foreground">{b.target_min}–{b.target_max}</td>
                <td className="p-4"><StatusBadge status={statusMap[b.status] || "neutral"} label={b.status} /></td>
                <td className="p-4 text-muted-foreground">{b.tested_at || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PremiumCard>
  );
}

function GeneticsList() {
  const { user } = useUser();
  const { data, error, isLoading, mutate } = useSWR(["genetics", user.id], async () => {
    const { data, error } = await supabase.from("genetic_traits").select("*").eq("member_id", user.id);
    if (error) throw error;
    return data || [];
  });
  
  if (isLoading) return <div className="space-y-4"><div className="h-32 w-full bg-muted/50 rounded-2xl animate-pulse"></div><div className="h-32 w-full bg-muted/50 rounded-2xl animate-pulse"></div></div>;
  if (error) return <div className="text-center p-6 text-destructive"><p>Failed to load genetics.</p><button onClick={() => mutate()} className="btn btn-outline text-xs mt-2">Try again</button></div>;
  if (!data || !data.length) return (
    <ModernEmptyState 
      icon={<Dna size={32} />}
      title="No Genetic Data"
      description="You haven't completed your whole genome sequencing or uploaded your 23andMe raw data."
    />
  );
  
  return (
    <div className="grid sm:grid-cols-2 gap-4" data-testid="genetics-list">
      {data.map((g: any) => {
        const statusMap: Record<string, StatusType> = {
          "positive": "success",
          "neutral": "info",
          "risk": "danger"
        };
        return (
          <PremiumCard key={g.id} className="flex flex-col h-full hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-lg">{g.trait_name}</h4>
              <StatusBadge status={statusMap[g.impact] || "neutral"} label={g.impact} />
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Variant: {g.variant}</p>
            <p className="text-sm text-foreground/80 leading-relaxed mt-auto">{g.plain_language_summary}</p>
          </PremiumCard>
        );
      })}
    </div>
  );
}

function BioAgeTrend() {
  const { user } = useUser();
  const { data, error, isLoading, mutate } = useSWR(["bioage", user.id], async () => {
    const { data, error } = await supabase.from("biological_age_records").select("*").eq("member_id", user.id).order("calculated_at", { ascending: true });
    if (error) throw error;
    return data || [];
  });
  
  if (isLoading) return <div className="h-40 w-full max-w-sm bg-muted/50 rounded-2xl animate-pulse"></div>;
  if (error) return <div className="text-center p-6 text-destructive"><p>Failed to load bio age data.</p><button onClick={() => mutate()} className="btn btn-outline text-xs mt-2">Try again</button></div>;
  if (!data || !data.length) return (
    <ModernEmptyState 
      icon={<Activity size={32} />}
      title="Awaiting First Lab"
      description="Your biological age will be calculated after your first comprehensive blood panel."
    />
  );
  
  const latest = data[data.length-1];
  return (
    <PremiumCard className="max-w-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
          <Activity size={24} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Latest biological age</p>
          <p className="text-xs text-muted-foreground">Calculated {new Date(latest.calculated_at).toLocaleDateString()}</p>
        </div>
      </div>
      <p className="font-display text-5xl tracking-tight">
        {latest.biological_age != null && String(latest.biological_age) !== "null" ? `${latest.biological_age} yrs` : "—"}
      </p>
    </PremiumCard>
  );
}
