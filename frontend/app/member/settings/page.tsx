"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User, Bell, Lock, Mail, Shield } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";

const supabase = createClient();

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [newPwd, setNewPwd] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setEmail(user.email || "");
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const full_name = f.get("full_name") as string;
    const { error } = await supabase.from("profiles").update({
      full_name,
      notification_prefs: {
        email_protocol_changes: f.get("email_protocol_changes") === "on",
        email_session_reminders: f.get("email_session_reminders") === "on",
      },
    }).eq("id", profile.id);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
  }

  async function changeEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return toast.error(error.message);
    toast.success("Confirmation sent to new email.");
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPwd.length < 8) return toast.error("Password too short");
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setNewPwd("");
  }

  if (isLoading) return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 space-y-4">
        <div className="h-10 w-48 bg-muted/50 rounded-lg animate-pulse"></div>
        <div className="h-6 w-96 bg-muted/50 rounded-lg animate-pulse"></div>
      </div>
      <div className="space-y-6">
        <div className="h-[400px] bg-muted/30 rounded-[24px] animate-pulse"></div>
        <div className="h-[200px] bg-muted/30 rounded-[24px] animate-pulse"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-center">
      <div className="p-8 bg-destructive/5 rounded-[24px] border border-destructive/20">
        <p className="text-destructive font-medium text-lg">Failed to load settings.</p>
        <button onClick={() => window.location.reload()} className="mt-4 btn btn-outline text-sm">Reload page</button>
      </div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10" data-testid="member-settings-page">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-medium tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your profile, preferences, and account security.</p>
      </div>

      <div className="space-y-8">
        {/* Profile & Notifications */}
        <PremiumCard className="overflow-hidden p-0">
          <div className="p-6 sm:p-8 border-b border-border/50 bg-muted/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[var(--vx-jade)]/10 flex items-center justify-center text-[var(--vx-jade)]">
                <User size={20} />
              </div>
              <h2 className="font-display text-2xl font-medium">Profile Information</h2>
            </div>
            <p className="text-muted-foreground text-sm ml-13">Update your personal details and notification preferences.</p>
          </div>
          
          <form onSubmit={saveProfile} className="p-6 sm:p-8 space-y-8">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Full Name</label>
              <input 
                data-testid="settings-name" 
                name="full_name" 
                defaultValue={profile.full_name} 
                className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--vx-jade)] transition-all shadow-sm max-w-md" 
                placeholder="Full name" 
              />
            </div>
            
            <div className="pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-muted-foreground" />
                <h3 className="font-medium text-lg">Notifications</h3>
              </div>
              
              <div className="space-y-4 text-[15px]">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      type="checkbox" 
                      name="email_protocol_changes" 
                      defaultChecked={profile.notification_prefs?.email_protocol_changes} 
                      className="peer appearance-none w-5 h-5 border border-border rounded shadow-sm bg-card checked:bg-[var(--vx-jade)] checked:border-[var(--vx-jade)] transition-all"
                    />
                    <svg className="absolute w-3.5 h-3.5 text-[var(--vx-ink)] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-[var(--vx-jade)] transition-colors">Protocol Updates</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Email me when my care team updates my protocol</p>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      type="checkbox" 
                      name="email_session_reminders" 
                      defaultChecked={profile.notification_prefs?.email_session_reminders} 
                      className="peer appearance-none w-5 h-5 border border-border rounded shadow-sm bg-card checked:bg-[var(--vx-jade)] checked:border-[var(--vx-jade)] transition-all"
                    />
                    <svg className="absolute w-3.5 h-3.5 text-[var(--vx-ink)] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-[var(--vx-jade)] transition-colors">Session Reminders</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Email me 24 hours before scheduled sessions</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" data-testid="settings-save" className="btn btn-primary shadow-md hover:shadow-lg transition-all px-8">
                Save Changes
              </button>
            </div>
          </form>
        </PremiumCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email Settings */}
          <PremiumCard className="overflow-hidden p-0 h-full flex flex-col">
            <div className="p-6 border-b border-border/50 bg-muted/10 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Mail size={16} />
                </div>
                <h2 className="font-display text-xl font-medium">Email Address</h2>
              </div>
            </div>
            
            <form onSubmit={changeEmail} className="p-6 flex flex-col flex-1">
              <div className="mb-6 flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Current Email</label>
                <input 
                  data-testid="settings-email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  type="email" 
                  className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" 
                  required
                />
              </div>
              <button type="submit" className="btn bg-card border border-border hover:bg-muted/50 w-full justify-center">
                Change Email Address
              </button>
            </form>
          </PremiumCard>

          {/* Password Settings */}
          <PremiumCard className="overflow-hidden p-0 h-full flex flex-col">
            <div className="p-6 border-b border-border/50 bg-muted/10 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Lock size={16} />
                </div>
                <h2 className="font-display text-xl font-medium">Password</h2>
              </div>
            </div>
            
            <form onSubmit={changePassword} className="p-6 flex flex-col flex-1">
              <div className="mb-6 flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">New Password</label>
                <input 
                  data-testid="settings-password" 
                  value={newPwd} 
                  onChange={(e) => setNewPwd(e.target.value)} 
                  type="password" 
                  className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm" 
                  placeholder="Enter new password (min 8 chars)" 
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" className="btn bg-card border border-border hover:bg-muted/50 w-full justify-center">
                Update Password
              </button>
            </form>
          </PremiumCard>
        </div>
        
        {/* Security Info */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <Shield size={14} />
          <p>Your connection to VitalityX is secure and encrypted.</p>
        </div>
      </div>
    </div>
  );
}
