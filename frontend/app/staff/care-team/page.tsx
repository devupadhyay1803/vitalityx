"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Search, Plus, Trash2, Shield, User, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

const ROLES = ['Physician', 'Health Coach', 'Nutritionist', 'Functional Medicine Practitioner', 'Lab Coordinator', 'Customer Success', 'Primary Care Lead'];

import { PremiumCard } from "@/components/ui/PremiumCard";
import { ModernEmptyState } from "@/components/dashboard/ModernEmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Users as UsersIcon } from "lucide-react";

export default function StaffCareTeamManagement() {
  const supabase = createClient();
  const [memberSearch, setMemberSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  
  // Modals/State
  const [assigningTo, setAssigningTo] = useState<string | null>(null); // Member ID
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);

  // Fetch Members
  const { data: members, error: membersError, isLoading: loadingMembers, mutate: mutateMembers } = useSWR("care-team-members", async () => {
    const { data } = await supabase
      .from("profiles")
      .select(`
        id, full_name, email,
        care_team_assignments!care_team_assignments_member_id_fkey(
          id, role, is_primary,
          staff:profiles!care_team_assignments_staff_id_fkey(
            id, full_name,
            staff_profiles(credentials, profile_photo)
          )
        )
      `)
      .eq("role", "Member")
      .order("created_at", { ascending: false });
    return data || [];
  });

  // Fetch Staff
  const { data: staffList } = useSWR("care-team-staff", async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", ["Coach", "Admin", "Ops"])
      .order("full_name");
    return data || [];
  });

  const filteredMembers = members?.filter(m => 
    m.full_name?.toLowerCase().includes(memberSearch.toLowerCase()) || 
    m.email?.toLowerCase().includes(memberSearch.toLowerCase())
  ) || [];

  const filteredStaff = staffList?.filter(s =>
    s.full_name?.toLowerCase().includes(staffSearch.toLowerCase())
  ) || [];

  async function handleAssign(staffId: string) {
    if (!assigningTo) return;
    const { error } = await supabase.from("care_team_assignments").insert({
      member_id: assigningTo,
      staff_id: staffId,
      role: selectedRole,
    });
    
    if (error) {
      if (error.code === '23505') toast.error("Staff member already assigned to this client.");
      else toast.error(error.message);
    } else {
      toast.success("Clinician assigned");
      // Trigger notification for member
      fetch("/api/notifications/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: assigningTo,
          title: "Care Team Updated",
          message: `A new ${selectedRole} has been assigned to your care team.`,
          type: "care_team_updated",
          category: "team",
          link: "/member/team"
        })
      });
      setAssigningTo(null);
    }
  }

  async function handleRemove(assignmentId: string) {
    const { error } = await supabase.from("care_team_assignments").delete().eq("id", assignmentId);
    if (error) toast.error(error.message);
    else toast.success("Clinician removed");
  }

  async function togglePrimary(assignmentId: string, currentStatus: boolean, memberId: string) {
    // If making primary, first unset primary for others
    if (!currentStatus) {
      await supabase.from("care_team_assignments").update({ is_primary: false }).eq("member_id", memberId);
    }
    const { error } = await supabase.from("care_team_assignments").update({ is_primary: !currentStatus }).eq("id", assignmentId);
    if (error) toast.error(error.message);
    else toast.success("Primary status updated");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="staff-care-team-page">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-medium tracking-tight">Care Team Management</h1>
        <p className="mt-2 text-muted-foreground text-lg">Assign clinicians, manage roles, and set primary care leads for members.</p>
      </div>

      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input 
          type="text"
          placeholder="Search members by name or email..."
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          className="w-full bg-muted/30 border border-border/50 rounded-2xl pl-12 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--vx-jade)] transition-all shadow-sm"
        />
      </div>

      <PremiumCard className="overflow-hidden p-0">
        {loadingMembers ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--vx-jade)] mb-4" />
            <p className="text-muted-foreground">Loading care team assignments...</p>
          </div>
        ) : membersError ? (
          <div className="p-8 text-center bg-red-500/5">
            <p className="text-destructive font-medium">Failed to load care team assignments.</p>
            <button onClick={() => mutateMembers()} className="mt-4 btn btn-outline">Try again</button>
          </div>
        ) : filteredMembers.length === 0 ? (
          <ModernEmptyState 
            icon={<UsersIcon size={32} />}
            title="No members found"
            description={memberSearch ? `No members matched "${memberSearch}".` : "There are no members in the system yet."}
            actionLabel={memberSearch ? "Clear search" : undefined}
            onAction={memberSearch ? () => setMemberSearch("") : undefined}
          />
        ) : (
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Member</th>
                  <th className="px-6 py-4 font-semibold w-1/2">Care Team</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m, i) => (
                  <tr key={m.id} className={`hover:bg-muted/30 transition-colors ${i !== filteredMembers.length - 1 ? 'border-b border-border/50' : ''}`}>
                    <td className="px-6 py-4 align-top">
                      <p className="font-medium text-foreground">{m.full_name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{m.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {m.care_team_assignments?.length === 0 ? (
                        <div className="inline-flex">
                          <StatusBadge status="warning" label="No team assigned" />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {m.care_team_assignments.reduce((acc: any[], current: any) => {
                            const staffId = current.staff?.id;
                            if (staffId && !acc.find((item: any) => item.staff?.id === staffId)) acc.push(current);
                            else if (!staffId) acc.push(current);
                            return acc;
                          }, []).map((a: any) => {
                            const profile = a.staff?.staff_profiles?.[0] || {};
                            return (
                              <div key={a.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/50 hover:border-border transition-colors group">
                                <div className="flex items-center gap-3">
                                  {profile.profile_photo ? (
                                    <img src={profile.profile_photo} alt={a.staff?.full_name || "Unknown"} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--vx-jade)]/20 to-[var(--vx-sapphire)]/20 flex items-center justify-center text-xs font-bold text-[var(--vx-ink)] shrink-0">
                                      {a.staff ? getInitials(a.staff.full_name) : "?"}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium">{a.staff ? a.staff.full_name : "Unavailable"}</p>
                                      {a.is_primary && (
                                        <span className="bg-[var(--vx-coral)] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-sm">
                                          Primary
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{a.role} {profile.credentials ? `• ${profile.credentials}` : ""}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => togglePrimary(a.id, a.is_primary, m.id)}
                                    title={a.is_primary ? "Remove Primary" : "Make Primary"}
                                    className={`p-2 rounded-lg transition-colors ${a.is_primary ? 'text-[var(--vx-coral)] bg-[var(--vx-coral)]/10 hover:bg-[var(--vx-coral)]/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                  >
                                    <Shield size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleRemove(a.id)}
                                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <button 
                        onClick={() => setAssigningTo(m.id)}
                        className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 inline-flex shadow-sm hover:border-[var(--vx-jade)] transition-colors"
                      >
                        <Plus size={14} /> Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PremiumCard>

      {assigningTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-[24px] bg-card shadow-2xl border border-white/10">
            <div className="p-6 border-b border-border/50 shrink-0 bg-muted/20">
              <h2 className="font-display text-2xl font-medium tracking-tight">Assign Clinician</h2>
              <p className="text-sm text-muted-foreground mt-1">Select a staff member and role for this member.</p>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Search Staff</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by name..." 
                    className="w-full bg-muted/30 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--vx-jade)] transition-all shadow-sm"
                    value={staffSearch}
                    onChange={e => setStaffSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Role</label>
                <select 
                  className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--vx-jade)] transition-all shadow-sm appearance-none"
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="border border-border/50 rounded-xl divide-y divide-border/50 mt-2 overflow-hidden bg-muted/10">
                {filteredStaff.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No staff found matching "{staffSearch}"
                  </div>
                ) : (
                  filteredStaff.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => handleAssign(s.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground group-hover:text-[var(--vx-jade)] transition-colors">{s.full_name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                      <Plus size={18} className="text-muted-foreground group-hover:text-[var(--vx-jade)] transition-colors" />
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border/50 flex justify-end shrink-0 bg-muted/20">
              <button onClick={() => setAssigningTo(null)} className="btn btn-ghost w-full sm:w-auto">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
