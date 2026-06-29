"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Search, Plus, Trash2, Shield, User, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

const ROLES = ['Physician', 'Health Coach', 'Nutritionist', 'Functional Medicine Practitioner', 'Lab Coordinator', 'Customer Success', 'Primary Care Lead'];

export default function StaffCareTeamManagement() {
  const supabase = createClient();
  const [memberSearch, setMemberSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  
  // Modals/State
  const [assigningTo, setAssigningTo] = useState<string | null>(null); // Member ID
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);

  // Fetch Members
  const { data: members, isLoading: loadingMembers } = useSWR("care-team-members", async () => {
    const { data } = await supabase
      .from("profiles")
      .select(`
        id, full_name, email,
        care_team_assignments(
          id, role, is_primary,
          staff:profiles!care_team_assignments_staff_id_fkey(id, full_name)
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
        <h1 className="font-display text-4xl font-medium">Care Team Management</h1>
        <p className="mt-2 text-muted-foreground">Assign clinicians, manage roles, and set primary care leads for members.</p>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input 
          type="text"
          placeholder="Search members..."
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          className="vx-input pl-10 w-full"
        />
      </div>

      <div className="vx-card overflow-hidden">
        {loadingMembers ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium w-1/2">Care Team</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {m.care_team_assignments?.length === 0 ? (
                        <span className="text-muted-foreground text-xs italic">No team assigned</span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {m.care_team_assignments.map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                  {getInitials(a.staff?.full_name)}
                                </div>
                                <div>
                                  <p className="text-xs font-medium">{a.staff?.full_name}</p>
                                  <p className="text-[10px] text-muted-foreground">{a.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => togglePrimary(a.id, a.is_primary, m.id)}
                                  title={a.is_primary ? "Remove Primary" : "Make Primary"}
                                  className={`p-1.5 rounded-md transition-colors ${a.is_primary ? 'text-[var(--vx-coral)] bg-[var(--vx-coral)]/10' : 'text-muted-foreground hover:bg-white/10'}`}
                                >
                                  <Shield size={14} />
                                </button>
                                <button 
                                  onClick={() => handleRemove(a.id)}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <button 
                        onClick={() => setAssigningTo(m.id)}
                        className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1 inline-flex"
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
      </div>

      {assigningTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl">
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-xl font-medium">Assign Clinician</h2>
              <p className="text-sm text-muted-foreground">Select a staff member and role.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">Search Staff</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by name..." 
                    className="vx-input pl-10 w-full"
                    value={staffSearch}
                    onChange={e => setStaffSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">Role</label>
                <select 
                  className="vx-input w-full appearance-none"
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="max-h-60 overflow-y-auto border border-border rounded-xl divide-y divide-border mt-4">
                {filteredStaff.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => handleAssign(s.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-sm">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    <Plus size={16} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={() => setAssigningTo(null)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
