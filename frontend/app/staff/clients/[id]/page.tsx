import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientTabs } from "@/components/staff/client-tabs";

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Access log (using admin client to bypass RLS on logs)
  const admin = createAdminClient();
  await admin.from("staff_access_logs").insert({ staff_id: user.id, member_id: id, resource_type: "client_overview" });

  const [{ data: profile }, { data: cr }, { data: items }, { data: biomarkers }, { data: labs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("client_records").select("*").eq("member_id", id).single(),
    supabase.from("protocol_items").select("*").eq("member_id", id).eq("active", true),
    supabase.from("biomarkers").select("*").eq("member_id", id).order("tested_at", { ascending: false }).limit(10),
    supabase.from("lab_results").select("*").eq("member_id", id).order("tested_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" data-testid="staff-client-detail">
      <h1 className="font-display text-4xl font-medium">{profile.full_name}</h1>
      <p className="mt-2 text-muted-foreground">{profile.email} · Goal: {profile.health_goal || "—"}</p>

      <ClientTabs id={id} />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card title="Intake"><pre className="text-xs whitespace-pre-wrap">{JSON.stringify(cr?.intake || {}, null, 2)}</pre></Card>
        <Card title="Consent">{cr?.consented ? <p className="text-sm text-[var(--vx-jade)]">Consented v{cr.consent_version} on {cr.consented_at?.split("T")[0]}</p> : <p className="text-sm text-muted-foreground">Not consented</p>}</Card>
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
  return <div className="vx-card p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p><div className="mt-3">{children}</div></div>;
}
