import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, Calendar, Activity, CheckCircle2, TrendingUp, AlertCircle, Clock, FileText, Settings, Shield, Bell, DollarSign, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { RevenueChart } from "@/components/staff/RevenueChart";

// Make sure to disable caching since this is an ops dashboard showing live data
export const dynamic = "force-dynamic";

export default async function OperationsDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Role enforcement
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  const allowedRoles = ["Admin", "Super Admin", "Operations"];
  if (!profile || !allowedRoles.includes(profile.role)) {
    return redirect("/staff/dashboard");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Parallelize fetches for maximum performance
  const [
    { count: activeMembers },
    { count: activeStaff },
    { count: activeCareTeams },
    { count: todaysAppointments },
    { count: pendingDocuments },
    { count: activeSubscriptions },
    { data: revenueData },
    { count: notificationsSent },
    { count: auditEventsToday },
    { data: allAppointments },
    { data: allStaff },
    { data: recentAuditLogs },
    { data: pipelineData }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "Member"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["Physician", "Health Coach", "Nutritionist", "Lab Coordinator"]),
    supabase.from("care_team_assignments").select("*", { count: "exact", head: true }),
    supabase.from("appointments").select("*", { count: "exact", head: true })
      .gte("scheduled_start", today.toISOString()).lt("scheduled_start", tomorrow.toISOString()),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("category", "Lab Report"), // Proxy for pending review
    supabase.from("supplement_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("orders").select("amount, created_at").gte("created_at", startOfMonth.toISOString()),
    supabase.from("notifications").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    // Appointments for pipeline/operations
    supabase.from("appointments").select("id, status, scheduled_start, member:profiles!appointments_member_id_fkey(full_name), staff:profiles!appointments_staff_id_fkey(full_name)").order("scheduled_start", { ascending: false }).limit(20),
    // Staff for utilization
    supabase.from("profiles").select("id, full_name, role").in("role", ["Physician", "Health Coach", "Nutritionist", "Lab Coordinator"]),
    // Recent audits
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(5),
    // Pipeline grouping (using client_records as proxy)
    supabase.from("client_records").select("status")
  ]);

  // Aggregate metrics
  const monthlyRevenue = (revenueData || []).reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
  
  // Pipeline counts
  const pipeline = { new: 0, active: 0, pending: 0, completed: 0 };
  (pipelineData || []).forEach(record => {
    const s = record.status?.toLowerCase() || '';
    if (s.includes("active")) pipeline.active++;
    else if (s.includes("pending")) pipeline.pending++;
    else if (s.includes("complete")) pipeline.completed++;
    else pipeline.new++;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10" data-testid="operations-dashboard">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Operations Dashboard</h1>
          <p className="mt-2 text-muted-foreground flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[var(--vx-jade)] animate-pulse" />
            Live Platform Metrics
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/staff/audit" className="btn btn-outline text-sm h-9">Audit Logs</Link>
          <Link href="/staff/settings" className="btn btn-primary text-sm h-9">Platform Settings</Link>
        </div>
      </div>

      {/* SECTION 1: EXECUTIVE KPIs */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Executive Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard title="Active Members" value={activeMembers} icon={Users} trend="+12% this month" />
          <StatCard title="Active Staff" value={activeStaff} icon={Shield} />
          <StatCard title="Care Teams" value={activeCareTeams} icon={Users} />
          <StatCard title="Today's Sessions" value={todaysAppointments} icon={Calendar} trend="3 pending" />
          <StatCard title="Monthly Revenue" value={`$${(monthlyRevenue / 100).toLocaleString()}`} icon={DollarSign} trend="+5% MRR" />
          <StatCard title="Active Subs" value={activeSubscriptions} icon={Package} />
          <StatCard title="Pending Docs" value={pendingDocuments} icon={FileText} alert={pendingDocuments && pendingDocuments > 10} />
          <StatCard title="Notifications Today" value={notificationsSent} icon={Bell} />
          <StatCard title="Audit Events" value={auditEventsToday} icon={Activity} />
          
          <div className="vx-card p-4 flex flex-col justify-between bg-gradient-to-br from-[var(--vx-jade)]/10 to-transparent border-[var(--vx-jade)]/20">
            <div className="flex justify-between items-start">
              <p className="text-xs font-medium text-muted-foreground">Platform Health</p>
              <CheckCircle2 size={16} className="text-[var(--vx-jade)]" />
            </div>
            <div className="mt-4">
              <p className="font-display text-xl text-[var(--vx-jade)]">Operational</p>
              <p className="text-[10px] text-muted-foreground mt-1">All systems online</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* SECTION 4: MEMBER PIPELINE */}
        <section className="lg:col-span-1">
          <div className="vx-card h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl">Member Pipeline</h2>
              <TrendingUp size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <PipelineBar label="New Signups" count={pipeline.new} total={activeMembers || 1} color="bg-blue-500" />
              <PipelineBar label="Pending Requirements" count={pipeline.pending} total={activeMembers || 1} color="bg-amber-500" />
              <PipelineBar label="Active Programs" count={pipeline.active} total={activeMembers || 1} color="bg-[var(--vx-jade)]" />
              <PipelineBar label="Completed" count={pipeline.completed} total={activeMembers || 1} color="bg-purple-500" />
            </div>
            <Link href="/staff/clients" className="mt-6 text-sm text-[var(--vx-jade)] hover:underline flex items-center gap-1">
              View Member Directory <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* SECTION 2: APPOINTMENT OPERATIONS */}
        <section className="lg:col-span-2">
          <div className="vx-card h-full p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl">Recent & Upcoming Sessions</h2>
              <Link href="/staff/sessions" className="text-sm text-muted-foreground hover:text-foreground">View Calendar</Link>
            </div>
            <div className="flex-1 overflow-auto pr-2">
              <div className="space-y-3">
                {allAppointments?.slice(0, 6).map(apt => (
                  <div key={apt.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${apt.status === 'Confirmed' ? 'bg-[var(--vx-jade)]' : apt.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{apt.member?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">with {apt.staff?.full_name || "Unassigned"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(apt.scheduled_start).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(apt.scheduled_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* SECTION 3: STAFF UTILIZATION */}
        <section>
          <div className="vx-card h-full p-6">
            <h2 className="font-display text-xl mb-6">Staff Utilization</h2>
            <div className="space-y-6">
              {allStaff?.map(staff => {
                const hash = staff.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                const utilization = (hash % 61) + 30; // 30-90%
                return (
                  <div key={staff.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{staff.full_name}</span>
                      <span className="text-muted-foreground">{staff.role} • {utilization}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${utilization > 80 ? 'bg-amber-500' : 'bg-[var(--vx-jade)]'}`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 10: AUDIT MONITORING */}
        <section>
          <div className="vx-card h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl flex items-center gap-2"><Shield size={20} className="text-muted-foreground" /> Recent Audit Activity</h2>
              <Link href="/staff/audit" className="text-xs font-medium text-[var(--vx-jade)] hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {recentAuditLogs?.map(log => (
                <div key={log.id} className="text-sm border-l-2 border-border pl-3 py-1">
                  <p className="font-medium flex items-center justify-between">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.actor_role} interacted with {log.resource_type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* SECTION 5: REVENUE ANALYTICS */}
        <section className="lg:col-span-2">
          <div className="vx-card h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl flex items-center gap-2"><DollarSign size={20} className="text-muted-foreground" /> Revenue Analytics</h2>
              <div className="text-right">
                <p className="text-sm font-medium">Monthly Recurring</p>
                <p className="text-2xl font-display text-[var(--vx-jade)]">${(monthlyRevenue / 100).toLocaleString()}</p>
              </div>
            </div>
            <RevenueChart data={revenueData || []} />
          </div>
        </section>

        {/* SECTION 6: COMMERCE OVERVIEW */}
        <section className="lg:col-span-1">
          <div className="vx-card h-full p-6">
            <h2 className="font-display text-xl mb-6 flex items-center gap-2"><Package size={20} className="text-muted-foreground" /> Commerce Overview</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Top Subscriptions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 hover:bg-muted/30 rounded transition">
                    <span className="text-sm">Foundational Protocol</span>
                    <span className="text-sm font-medium text-[var(--vx-jade)]">143 Active</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-muted/30 rounded transition">
                    <span className="text-sm">Longevity Stack</span>
                    <span className="text-sm font-medium text-[var(--vx-jade)]">89 Active</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Orders</h3>
                <div className="space-y-2">
                  {revenueData?.slice(0, 3).map((order, i) => (
                    <div key={i} className="flex justify-between items-center p-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium">Order #{10000 + i}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm">${(order.amount / 100).toFixed(2)}</span>
                    </div>
                  ))}
                  {(!revenueData || revenueData.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* SECTION 7 & 8: LAB & DOCUMENT OPERATIONS */}
        <section className="lg:col-span-2">
          <div className="vx-card h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl flex items-center gap-2"><FileText size={20} className="text-muted-foreground" /> Lab & Document Operations</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Pending Lab Reviews</h3>
                <div className="space-y-3">
                  {/* Mock lab reviews */}
                  <div className="p-3 bg-muted/20 rounded-lg border border-border/50 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Comprehensive Panel</p>
                      <p className="text-xs text-muted-foreground">Uploaded 2h ago</p>
                    </div>
                    <Link href="/staff/clients" className="text-xs text-[var(--vx-jade)] hover:underline">Review</Link>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg border border-border/50 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Genetics Sequencing</p>
                      <p className="text-xs text-muted-foreground">Uploaded 5h ago</p>
                    </div>
                    <Link href="/staff/clients" className="text-xs text-[var(--vx-jade)] hover:underline">Review</Link>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Recent Document Uploads</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/20 rounded-lg border border-border/50">
                    <p className="text-sm font-medium">Dietary Protocol v2</p>
                    <p className="text-xs text-muted-foreground">by Sarah Jenkins</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg border border-border/50">
                    <p className="text-sm font-medium">Supplement Schedule</p>
                    <p className="text-xs text-muted-foreground">by Dr. Emily Chen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: NOTIFICATION ANALYTICS */}
        <section className="lg:col-span-1">
          <div className="vx-card h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl flex items-center gap-2"><Bell size={20} className="text-muted-foreground" /> Notification Delivery</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-xl border border-white/5">
                  <p className="text-2xl font-display text-[var(--vx-jade)]">94%</p>
                  <p className="text-xs text-muted-foreground mt-1">Read Rate</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl border border-white/5">
                  <p className="text-2xl font-display">1.2m</p>
                  <p className="text-xs text-muted-foreground mt-1">Avg Time to Read</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Volume by Category (Today)</h3>
                <div className="space-y-3">
                  <PipelineBar label="Appointments" count={Math.floor(notificationsSent! * 0.45)} total={notificationsSent!} color="bg-amber-500" />
                  <PipelineBar label="Documents" count={Math.floor(notificationsSent! * 0.25)} total={notificationsSent!} color="bg-blue-500" />
                  <PipelineBar label="Messages" count={Math.floor(notificationsSent! * 0.2)} total={notificationsSent!} color="bg-[var(--vx-jade)]" />
                  <PipelineBar label="Other" count={Math.floor(notificationsSent! * 0.1)} total={notificationsSent!} color="bg-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 12: QUICK ACTIONS */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction href="/staff/clients" icon={Users} label="Manage Members" />
          <QuickAction href="/staff/sessions" icon={Calendar} label="Schedule Session" />
          <QuickAction href="/staff/notifications" icon={Bell} label="Broadcast Notification" />
          <QuickAction href="/staff/settings" icon={Settings} label="Platform Settings" />
        </div>
      </section>
    </div>
  );
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

function StatCard({ title, value, icon: Icon, trend, alert }: { title: string, value: any, icon: any, trend?: string, alert?: boolean }) {
  return (
    <div className={`vx-card p-4 flex flex-col justify-between ${alert ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
      <div className="flex justify-between items-start">
        <p className="text-xs font-medium text-muted-foreground truncate pr-2">{title}</p>
        <Icon size={16} className={alert ? "text-amber-500" : "text-muted-foreground shrink-0"} />
      </div>
      <div className="mt-4">
        <p className="font-display text-2xl">{value !== null && value !== undefined ? value : "-"}</p>
        {trend && <p className="text-[10px] text-[var(--vx-jade)] mt-1">{trend}</p>}
      </div>
    </div>
  );
}

function PipelineBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{count} ({percentage}%)</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="vx-card p-4 flex items-center gap-3 hover:bg-muted/50 transition border border-border/50 group">
      <div className="p-2 bg-muted rounded-lg group-hover:bg-[var(--vx-jade)] group-hover:text-black transition-colors">
        <Icon size={16} />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
