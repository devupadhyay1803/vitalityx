"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Mail, Shield, ShieldCheck, ShieldAlert, Key } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";

const supabase = createClient();

export default function StaffSettings() {
  const [email, setEmail] = useState("");
  const [mfaEnrolled, setMfaEnrolled] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email || "");
      const { data } = await supabase.auth.mfa.listFactors();
      setMfaEnrolled((data?.totp?.length || 0) > 0);
    })();
  }, []);

  async function enrollMfa() {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "VitalityX TOTP" });
    if (error) return toast.error(error.message);
    if (data) {
      window.alert("Scan this QR with Google Authenticator or 1Password, then save:\n\n" + (data.totp.qr_code ? "QR available in console" : data.totp.secret));
      console.log("[VitalityX MFA enroll]", data);
      toast.success("Open browser console for QR / secret. Verify in Supabase Auth.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10" data-testid="staff-settings-page">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-medium tracking-tight">Staff Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your staff account and security preferences.</p>
      </div>

      <div className="space-y-8">
        {/* Account Info */}
        <PremiumCard className="overflow-hidden p-0">
          <div className="p-6 sm:p-8 border-b border-border/50 bg-muted/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[var(--vx-jade)]/10 flex items-center justify-center text-[var(--vx-jade)]">
                <Mail size={20} />
              </div>
              <h2 className="font-display text-2xl font-medium">Account Details</h2>
            </div>
            <p className="text-muted-foreground text-sm ml-13">View your staff email and role information.</p>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center shrink-0 shadow-sm">
                <Mail size={20} className="text-muted-foreground" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Staff Email</label>
                <p className="font-medium text-lg text-foreground">{email}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 ml-2 flex items-center gap-2">
              <Shield size={14} /> Only administrators can change staff email addresses.
            </p>
          </div>
        </PremiumCard>

        {/* Security Settings */}
        <PremiumCard className="overflow-hidden p-0">
          <div className="p-6 sm:p-8 border-b border-border/50 bg-muted/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Key size={20} />
              </div>
              <h2 className="font-display text-2xl font-medium">Security Settings</h2>
            </div>
            <p className="text-muted-foreground text-sm ml-13">Manage your two-factor authentication.</p>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className={`border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors ${
              mfaEnrolled ? "bg-[var(--vx-jade)]/5 border-[var(--vx-jade)]/20" : "bg-muted/30 border-border/50"
            }`}>
              <div className="flex items-start sm:items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  mfaEnrolled ? "bg-[var(--vx-jade)]/20 text-[var(--vx-jade)]" : "bg-card border border-border/50 text-muted-foreground"
                }`}>
                  {mfaEnrolled ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div>
                  <h3 className="font-medium text-lg">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    {mfaEnrolled 
                      ? "Your account is secured with TOTP two-factor authentication." 
                      : "Not enrolled. We highly recommend enrolling TOTP for stronger security on staff accounts."}
                  </p>
                </div>
              </div>
              
              {!mfaEnrolled ? (
                <button 
                  data-testid="enroll-mfa" 
                  onClick={enrollMfa} 
                  className="btn btn-primary shadow-md hover:shadow-lg transition-all shrink-0 w-full sm:w-auto justify-center"
                >
                  Enroll TOTP
                </button>
              ) : (
                <div className="shrink-0 flex items-center gap-2 text-[var(--vx-jade)] font-medium bg-[var(--vx-jade)]/10 px-4 py-2 rounded-lg">
                  <ShieldCheck size={16} /> Enrolled
                </div>
              )}
            </div>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}
