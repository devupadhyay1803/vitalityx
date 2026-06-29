import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ClientTabs } from "@/components/staff/client-tabs";
import { Activity, FileText, Upload, CheckCircle2 } from "lucide-react";

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();
  
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!profile) notFound();

  // Fetch various records to build a unified timeline
  const [{ data: logs }, { data: labs }] = await Promise.all([
    admin.from("staff_access_logs").select("*").eq("member_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("lab_results").select("*").eq("member_id", id).order("created_at", { ascending: false }).limit(5),
  ]);

  // Combine and sort events
  const events = [];
  
  // 1. Staff access logs
  if (logs) {
    for (const log of logs) {
      events.push({
        id: `log-${log.id}`,
        type: "access",
        title: "Staff Access",
        description: `Staff member (${log.staff_id.substring(0,6)}) accessed ${log.resource_type}`,
        date: new Date(log.created_at),
        icon: <Activity size={16} className="text-blue-500" />
      });
    }
  }

  // 2. Lab uploads
  if (labs) {
    for (const lab of labs) {
      events.push({
        id: `lab-${lab.id}`,
        type: "lab",
        title: "Lab Result Uploaded",
        description: `Biological Age: ${lab.biological_age || "N/A"}. Tested on ${lab.tested_at}`,
        date: new Date(lab.created_at),
        icon: <Upload size={16} className="text-amber-500" />
      });
    }
  }

  // 3. Account creation (mocked based on profile)
  if (profile.created_at) {
    events.push({
      id: "account-created",
      type: "system",
      title: "Account Created",
      description: "Member completed signup flow.",
      date: new Date(profile.created_at),
      icon: <CheckCircle2 size={16} className="text-[var(--vx-jade)]" />
    });
  }

  // Sort descending
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" data-testid="staff-client-timeline">
      <h1 className="font-display text-4xl font-medium">{profile.full_name}</h1>
      <ClientTabs id={id} />

      <div className="mt-8 max-w-3xl">
        <h2 className="font-display text-xl mb-6">Audit Log & Timeline</h2>
        
        <div className="relative border-l border-border pl-6 space-y-8">
          {events.map((e) => (
            <div key={e.id} className="relative">
              <div className="absolute -left-[35px] bg-card p-1 rounded-full border border-border flex items-center justify-center">
                {e.icon}
              </div>
              <div className="vx-card p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-sm">{e.title}</h3>
                  <span className="text-xs text-muted-foreground">{e.date.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{e.description}</p>
              </div>
            </div>
          ))}
          
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground">No timeline events found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
