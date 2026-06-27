"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
    <div className="mx-auto max-w-2xl px-6 py-10" data-testid="staff-settings-page">
      <h1 className="font-display text-4xl font-medium">Settings</h1>
      <div className="mt-6 vx-card p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Account</p>
        <p className="mt-2 text-sm">{email}</p>
      </div>
      <div className="mt-4 vx-card p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Two-factor authentication</p>
        <p className="mt-2 text-sm">{mfaEnrolled ? "✓ TOTP enrolled" : "Not enrolled — enroll TOTP for stronger security."}</p>
        {!mfaEnrolled && <button data-testid="enroll-mfa" onClick={enrollMfa} className="btn btn-outline mt-3">Enroll TOTP</button>}
      </div>
    </div>
  );
}
