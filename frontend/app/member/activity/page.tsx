"use client";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/portal/user-provider";
import Link from "next/link";
import { fetchMemberAuditLogs } from "./actions";
import {
 Calendar, FlaskConical, ListChecks, Users, MessageSquare,
 Package, Activity, CheckCircle2, FileText, XCircle, RefreshCw,
 Clock, Dna
} from "lucide-react";

const supabase = createClient();

interface TimelineEvent {
 id: string;
 title: string;
 description: string;
 date: Date;
 iconName: string;
 iconColor: string;
 link?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
 Calendar, FlaskConical, ListChecks, Users, MessageSquare,
 Package, Activity, CheckCircle2, FileText, XCircle, RefreshCw,
 Clock, Dna,
};

async function fetchActivity(userId: string): Promise<TimelineEvent[]> {
 const events: TimelineEvent[] = [];

 const [
 { data: appointments },
 { data: labs },
 { data: protocolItems },
 { data: bioRecords },
 { data: careTeam },
 { data: documents },
 { data: orders },
 { data: subs },
 { data: notifications },
 { data: protocolCompletions },
 auditLogs,
 ] = await Promise.all([
 supabase.from("appointments").select("id,title,status,scheduled_start,session_type,updated_at,created_at").eq("member_id", userId).order("created_at", { ascending: false }).limit(50),
 supabase.from("lab_results").select("id,biological_age,tested_at,created_at").eq("member_id", userId).order("created_at", { ascending: false }).limit(20),
 supabase.from("protocol_items").select("id,title,created_at,active").eq("member_id", userId).order("created_at", { ascending: false }).limit(30),
 supabase.from("biological_age_records").select("id,biological_age,longevity_score,calculated_at,created_at").eq("member_id", userId).order("calculated_at", { ascending: false }).limit(10),
 supabase.from("care_team_assignments").select("id,role,created_at,staff:profiles!care_team_assignments_staff_id_fkey(full_name)").eq("member_id", userId).order("created_at", { ascending: false }).limit(20),
 supabase.from("documents").select("id,title,category,created_at").eq("member_id", userId).order("created_at", { ascending: false }).limit(20),
 supabase.from("orders").select("id,amount_total,currency,created_at").eq("member_id", userId).order("created_at", { ascending: false }).limit(20),
 supabase.from("supplement_subscriptions").select("id,product_name,status,created_at").eq("member_id", userId).order("created_at", { ascending: false }).limit(20),
 supabase.from("notifications").select("id,title,message,type,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
 supabase.from("protocol_completions").select("id,item_id,completed_at,item:protocol_items(title)").eq("member_id", userId).order("completed_at", { ascending: false }).limit(20),
 fetchMemberAuditLogs(userId),
 ]);

 // Appointments
 for (const apt of appointments ?? []) {
 try {
 events.push({ id: `apt-booked-${apt.id}`, title: "Appointment Booked", description: `${apt.title ?? "Session"} scheduled for ${apt.scheduled_start ? new Date(apt.scheduled_start).toLocaleDateString() : "TBD"}.`, date: new Date(apt.created_at), iconName: "Calendar", iconColor: "text-blue-400", link: "/member/sessions" });
 if (apt.status === "Cancelled" && apt.updated_at !== apt.created_at) events.push({ id: `apt-cancelled-${apt.id}`, title: "Appointment Cancelled", description: `${apt.title ?? "Session"} was cancelled.`, date: new Date(apt.updated_at), iconName: "XCircle", iconColor: "text-destructive", link: "/member/sessions" });
 else if (apt.status === "Rescheduled" && apt.updated_at !== apt.created_at) events.push({ id: `apt-rescheduled-${apt.id}`, title: "Appointment Rescheduled", description: `${apt.title ?? "Session"} was rescheduled to ${apt.scheduled_start ? new Date(apt.scheduled_start).toLocaleDateString() : "TBD"}.`, date: new Date(apt.updated_at), iconName: "RefreshCw", iconColor: "text-amber-400", link: "/member/sessions" });
 else if (apt.status === "Confirmed" && apt.updated_at !== apt.created_at) events.push({ id: `apt-confirmed-${apt.id}`, title: "Appointment Confirmed", description: `${apt.title ?? "Session"} was confirmed by your care team.`, date: new Date(apt.updated_at), iconName: "CheckCircle2", iconColor: "text-[var(--vx-jade)]", link: "/member/sessions" });
 else if (apt.status === "Completed" && apt.updated_at !== apt.created_at) events.push({ id: `apt-completed-${apt.id}`, title: "Session Completed", description: `${apt.title ?? "Session"} was completed.`, date: new Date(apt.updated_at), iconName: "CheckCircle2", iconColor: "text-[var(--vx-jade)]", link: "/member/sessions" });
 } catch { /* skip malformed rows */ }
 }

 // Lab results
 for (const lab of labs ?? []) {
 try { events.push({ id: `lab-${lab.id}`, title: "Lab Result Uploaded", description: lab.biological_age != null ? `Biological Age: ${lab.biological_age} yrs. Tested ${lab.tested_at ?? "—"}.` : `Lab results uploaded. Tested ${lab.tested_at ?? "—"}.`, date: new Date(lab.created_at), iconName: "FlaskConical", iconColor: "text-amber-400", link: "/member/data" }); } catch { /* skip */ }
 }

 // Protocol items
 for (const item of protocolItems ?? []) {
 try { events.push({ id: `protocol-${item.id}`, title: "Protocol Item Assigned", description: `"${item.title ?? "New item"}" was added to your protocol.`, date: new Date(item.created_at), iconName: "ListChecks", iconColor: "text-purple-400", link: "/member/protocol" }); } catch { /* skip */ }
 }

 // Biological age records
 for (const rec of bioRecords ?? []) {
 try { events.push({ id: `bioage-${rec.id}`, title: "Biological Age Calculated", description: rec.biological_age != null ? `Your biological age is ${rec.biological_age} yrs. Longevity score: ${rec.longevity_score ?? "—"}.` : "A new biological age calculation was completed.", date: new Date(rec.calculated_at ?? rec.created_at), iconName: "Dna", iconColor: "text-[var(--vx-jade)]", link: "/member/data" }); } catch { /* skip */ }
 }

 // Care team assignments
 for (const assignment of careTeam ?? []) {
 try {
 const staffArr = assignment.staff as { full_name?: string }[] | null;
 const staffName = staffArr?.[0]?.full_name ?? "A clinician";
 events.push({ id: `team-${assignment.id}`, title: "Care Team Updated", description: `${staffName} was assigned to your care team as ${assignment.role}.`, date: new Date(assignment.created_at), iconName: "Users", iconColor: "text-blue-400", link: "/member/team" });
 } catch { /* skip */ }
 }

 // Documents
 for (const doc of documents ?? []) {
 try { events.push({ id: `doc-${doc.id}`, title: "Document Uploaded", description: `"${doc.title}" (${doc.category}) was uploaded to your records.`, date: new Date(doc.created_at), iconName: "FileText", iconColor: "text-muted-foreground", link: "/member/labs" }); } catch { /* skip */ }
 }

 // Orders
 for (const order of orders ?? []) {
 try {
 const amount = order.amount_total != null ? `$${(order.amount_total / 100).toFixed(2)}` : "";
 events.push({ id: `order-${order.id}`, title: "Supplement Order Placed", description: `Order placed${amount ? ` for ${amount}` : ""}.`, date: new Date(order.created_at), iconName: "Package", iconColor: "text-amber-400", link: "/member/supplements" });
 } catch { /* skip */ }
 }

 // Supplement subscriptions
 for (const sub of subs ?? []) {
 try {
 if (sub.status === "active") events.push({ id: `sub-start-${sub.id}`, title: "Subscription Started", description: `Subscription for "${sub.product_name ?? "supplement"}" was activated.`, date: new Date(sub.created_at), iconName: "CheckCircle2", iconColor: "text-[var(--vx-jade)]", link: "/member/supplements" });
 else if (sub.status === "cancelled") events.push({ id: `sub-cancel-${sub.id}`, title: "Subscription Cancelled", description: `Subscription for "${sub.product_name ?? "supplement"}" was cancelled.`, date: new Date(sub.created_at), iconName: "XCircle", iconColor: "text-destructive", link: "/member/supplements" });
 } catch { /* skip */ }
 }

 // Notifications — only message-type to avoid duplicates
 for (const notif of notifications ?? []) {
 try {
 if (notif.type?.includes("message")) events.push({ id: `notif-${notif.id}`, title: "Message Received", description: notif.message ?? notif.title ?? "You received a new message.", date: new Date(notif.created_at), iconName: "MessageSquare", iconColor: "text-blue-400", link: "/member/messages" });
 } catch { /* skip */ }
 }

 // Protocol Completions
 for (const pc of protocolCompletions ?? []) {
 try {
 const itemData = pc.item as any;
 const itemTitle = Array.isArray(itemData) ? itemData[0]?.title : itemData?.title;
 events.push({ id: `pc-${pc.id}`, title: "Protocol Completed", description: `You completed "${itemTitle ?? "a protocol task"}".`, date: new Date(pc.completed_at), iconName: "CheckCircle2", iconColor: "text-[var(--vx-jade)]", link: "/member/dashboard" });
 } catch { /* skip */ }
 }

 // Audit Logs
 for (const log of auditLogs ?? []) {
 try {
 if (log.action === "Protocol updated") {
 events.push({ id: `audit-${log.id}`, title: "Protocol Updated", description: "Your care protocol was updated.", date: new Date(log.created_at), iconName: "ListChecks", iconColor: "text-purple-400", link: "/member/dashboard" });
 } else if (log.action === "Lab reviewed") {
 events.push({ id: `audit-${log.id}`, title: "Lab Reviewed", description: "Your lab results were reviewed by the care team.", date: new Date(log.created_at), iconName: "FlaskConical", iconColor: "text-amber-400", link: "/member/dashboard" });
 }
 } catch { /* skip */ }
 }


 // Deduplicate
 const seen = new Set<string>();
 const unique = events.filter((e) => { if (seen.has(e.id)) return false; seen.add(e.id); return true; });

 // Sort newest first
 unique.sort((a, b) => b.date.getTime() - a.date.getTime());
 return unique;
}

import { ModernEmptyState } from "@/components/dashboard/ModernEmptyState";
import { TimelineItem } from "@/components/ui/TimelineItem";

export default function ActivityPage() {
  const { user } = useUser();
  const { data: events, isLoading } = useSWR(["member-activity", user.id], () => fetchActivity(user.id), { revalidateOnFocus: false });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10" data-testid="member-activity-page">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-medium tracking-tight">Activity History</h1>
        <p className="mt-2 text-muted-foreground text-lg">A complete record of your health journey.</p>
      </div>

      <div className="mt-10">
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/50" />)}
          </div>
        )}

        {!isLoading && (!events || events.length === 0) && (
          <ModernEmptyState 
            icon={<Activity size={32} />}
            title="No Activity Yet"
            description="Your activity history will appear here once you book a session, complete a protocol, or receive lab results."
          />
        )}

        {!isLoading && events && events.length > 0 && (
          <div className="space-y-0 relative ml-2">
            {events.map((event, index) => {
              const Icon = ICON_MAP[event.iconName] ?? Activity;
              const isLast = index === events.length - 1;
              
              const formattedDate = `${event.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at ${event.date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
              
              return (
                <TimelineItem
                  key={event.id}
                  isLast={isLast}
                  icon={<Icon size={18} className={event.iconColor} />}
                  title={event.title}
                  timestamp={formattedDate}
                  description={
                    <div className="mt-1">
                      <p>{event.description}</p>
                      {event.link && (
                        <Link href={event.link} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--vx-jade)] hover:underline">
                          View details →
                        </Link>
                      )}
                    </div>
                  }
                  className="hover:bg-transparent"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
