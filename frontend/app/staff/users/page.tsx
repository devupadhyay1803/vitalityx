"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/portal/user-provider";
import { Search, ShieldAlert, Edit, Check, X, Shield, Lock, RotateCcw, AlertTriangle, Key } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";

const supabase = createClient();

export default function UsersManagementPage() {
  const { profile } = useUser();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Modals / forms
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: users, isLoading, error, mutate } = useSWR("admin-all-users", async () => {
    if (profile?.role !== "Admin") return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  });

  if (profile?.role !== "Admin") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <EmptyState 
          icon={ShieldAlert}
          title="Access Restricted"
          description="Only users with the role of Admin are authorized to access Users Management."
        />
      </div>
    );
  }

  const roles = ["All", "Member", "Coach", "Admin", "Ops"];
  const statuses = ["All", "Active", "Disabled"];

  const filteredUsers = (users || []).filter((u: any) => {
    const isValDisabled = u.notification_prefs?.disabled === true;
    const matchesSearch = 
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesStatus = statusFilter === "All" || 
      (statusFilter === "Active" && !isValDisabled) || 
      (statusFilter === "Disabled" && isValDisabled);

    return matchesSearch && matchesRole && matchesStatus;
  });

  async function handleToggleStatus(user: any) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_status",
          targetUserId: user.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle status");

      toast.success(data.disabled ? "User has been disabled" : "User has been enabled");
      mutate();
      if (selectedUser?.id === user.id) {
        setSelectedUser({
          ...selectedUser,
          notification_prefs: {
            ...selectedUser.notification_prefs,
            disabled: data.disabled
          }
        });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangeRole() {
    if (isSubmitting || !selectedUser) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_role",
          targetUserId: selectedUser.id,
          newRole
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change role");

      toast.success(`User role successfully changed to ${newRole}`);
      setShowRoleModal(false);
      mutate();
      setSelectedUser({ ...selectedUser, role: newRole });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword() {
    if (isSubmitting || !selectedUser) return;
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          targetUserId: selectedUser.id,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      toast.success("User password reset successfully.");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10" data-testid="staff-users-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[var(--vx-jade)]/10 text-[var(--vx-jade)] rounded-xl">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Users Management</h1>
          <p className="mt-1 text-muted-foreground">Manage user accounts, roles, access status, and credentials.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 my-8">
        {/* Main Users Directory */}
        <div className="lg:col-span-2 space-y-6">
          <PremiumCard className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text"
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="vx-input pl-10 w-full"
                />
              </div>

              <div className="flex gap-2">
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)} 
                  className="vx-input min-w-[120px]"
                >
                  {roles.map(r => <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>)}
                </select>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)} 
                  className="vx-input min-w-[130px]"
                >
                  {statuses.map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-12 w-full bg-muted/50 rounded-lg animate-pulse" />
                <div className="h-12 w-full bg-muted/50 rounded-lg animate-pulse" />
                <div className="h-12 w-full bg-muted/50 rounded-lg animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-center py-8 text-destructive font-medium">Failed to load users directory.</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No users found matching filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      <th className="pb-3 pr-4">User</th>
                      <th className="pb-3 px-4">Role</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredUsers.map((u: any) => {
                      const isDisabled = u.notification_prefs?.disabled === true;
                      return (
                        <tr 
                          key={u.id} 
                          onClick={() => setSelectedUser(u)}
                          className={`text-sm cursor-pointer hover:bg-muted/20 transition-all ${selectedUser?.id === u.id ? "bg-muted/40 border-l-2 border-[var(--vx-jade)]" : ""}`}
                        >
                          <td className="py-3.5 pr-4">
                            <div className="font-semibold text-foreground">{u.full_name || "New User"}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={u.role === "Admin" ? "danger" : u.role === "Coach" ? "info" : "neutral"} label={u.role} />
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={isDisabled ? "danger" : "success"} label={isDisabled ? "Disabled" : "Active"} />
                          </td>
                          <td className="py-3.5 pl-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => { setSelectedUser(u); setNewRole(u.role); setShowRoleModal(true); }}
                              className="p-2 hover:bg-card border border-transparent hover:border-border rounded-xl text-muted-foreground hover:text-foreground transition-all mr-1.5"
                              title="Change Role"
                            >
                              <Shield size={14} />
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(u)}
                              className={`p-2 border border-transparent rounded-xl transition-all ${isDisabled ? "text-green-600 hover:bg-green-500/10 hover:border-green-500/20" : "text-red-500 hover:bg-red-500/10 hover:border-red-500/20"}`}
                              title={isDisabled ? "Enable User" : "Disable User"}
                              disabled={isSubmitting}
                            >
                              {isDisabled ? <Check size={14} /> : <X size={14} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </PremiumCard>
        </div>

        {/* User Details Sidebar / Action panel */}
        <div className="space-y-6">
          {selectedUser ? (
            <PremiumCard className="p-6 border border-[var(--vx-jade)]/20 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                <h2 className="font-display text-xl font-medium">User Profile</h2>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-semibold">Full Name</div>
                  <div className="text-lg font-semibold text-foreground">{selectedUser.full_name || "—"}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-semibold">Email Address</div>
                  <div className="text-sm font-medium text-foreground">{selectedUser.email || "—"}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 font-semibold">Access Role</div>
                    <StatusBadge status={selectedUser.role === "Admin" ? "danger" : selectedUser.role === "Coach" ? "info" : "neutral"} label={selectedUser.role} />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 font-semibold">Account Status</div>
                    <StatusBadge 
                      status={selectedUser.notification_prefs?.disabled === true ? "danger" : "success"} 
                      label={selectedUser.notification_prefs?.disabled === true ? "Disabled" : "Active"} 
                    />
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6 space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Administrative Controls</h3>

                  <button 
                    onClick={() => { setNewRole(selectedUser.role); setShowRoleModal(true); }}
                    className="w-full btn btn-outline flex items-center justify-center gap-2 text-sm"
                  >
                    <Shield size={14} /> Change User Role
                  </button>

                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full btn btn-outline flex items-center justify-center gap-2 text-sm"
                  >
                    <Key size={14} /> Reset User Password
                  </button>

                  <button 
                    onClick={() => handleToggleStatus(selectedUser)}
                    disabled={isSubmitting}
                    className={`w-full btn flex items-center justify-center gap-2 text-sm ${
                      selectedUser.notification_prefs?.disabled === true
                        ? "bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20"
                        : "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20"
                    }`}
                  >
                    {selectedUser.notification_prefs?.disabled === true ? (
                      <>
                        <Check size={14} /> Enable Account Access
                      </>
                    ) : (
                      <>
                        <X size={14} /> Disable Account Access
                      </>
                    )}
                  </button>
                </div>
              </div>
            </PremiumCard>
          ) : (
            <div className="h-full border border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <Shield className="h-12 w-12 text-muted-foreground/30 mb-4 animate-pulse" />
              <h3 className="font-semibold mb-1">No User Selected</h3>
              <p className="text-xs text-muted-foreground max-w-[200px]">Select a user from the directory grid to perform administrative updates.</p>
            </div>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="font-display text-xl font-medium mb-2">Change Access Role</h3>
            <p className="text-xs text-muted-foreground mb-6">Change role of {selectedUser.full_name || selectedUser.email} across the platform.</p>
            
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Select New Role</label>
              <select 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)} 
                className="vx-input w-full"
              >
                {roles.filter(r => r !== "All").map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <div className="flex gap-2 justify-end mt-8">
                <button 
                  onClick={() => setShowRoleModal(false)}
                  className="btn btn-outline text-xs h-9"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleChangeRole}
                  className="btn btn-primary text-xs h-9 flex items-center gap-1.5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Update Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="font-display text-xl font-medium mb-2">Reset Password</h3>
            <p className="text-xs text-muted-foreground mb-6">Set a new password for {selectedUser.full_name || selectedUser.email}.</p>
            
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">New Password</label>
              <input 
                type="password"
                placeholder="Enter new secure password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="vx-input w-full"
              />

              <div className="flex gap-2 justify-end mt-8">
                <button 
                  onClick={() => { setShowPasswordModal(false); setNewPassword(""); }}
                  className="btn btn-outline text-xs h-9"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResetPassword}
                  className="btn btn-primary text-xs h-9"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
