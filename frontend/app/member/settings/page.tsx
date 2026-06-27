"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [newPwd, setNewPwd] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
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

  async function changeEmail() {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return toast.error(error.message);
    toast.success("Confirmation sent to new email.");
  }
  async function changePassword() {
    if (newPwd.length < 8) return toast.error("Password too short");
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setNewPwd("");
  }

  if (!profile) return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10" data-testid="member-settings-page">
      <h1 className="font-display text-4xl font-medium">Settings</h1>

      <form onSubmit={saveProfile} className="mt-8 vx-card p-6 space-y-4">
        <h2 className="font-display text-xl">Profile</h2>
        <input data-testid="settings-name" name="full_name" defaultValue={profile.full_name} className="vx-input" placeholder="Full name" />
        <div className="space-y-2 text-sm">
          <label className="flex gap-2"><input type="checkbox" name="email_protocol_changes" defaultChecked={profile.notification_prefs?.email_protocol_changes} /> Email me on protocol changes</label>
          <label className="flex gap-2"><input type="checkbox" name="email_session_reminders" defaultChecked={profile.notification_prefs?.email_session_reminders} /> Email me 24h before sessions</label>
        </div>
        <button data-testid="settings-save" className="btn btn-primary">Save</button>
      </form>

      <div className="mt-6 vx-card p-6 space-y-3">
        <h2 className="font-display text-xl">Email</h2>
        <input data-testid="settings-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="vx-input" />
        <button onClick={changeEmail} className="btn btn-outline">Change email</button>
      </div>

      <div className="mt-6 vx-card p-6 space-y-3">
        <h2 className="font-display text-xl">Password</h2>
        <input data-testid="settings-password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} type="password" className="vx-input" placeholder="New password" />
        <button onClick={changePassword} className="btn btn-outline">Update password</button>
      </div>
    </div>
  );
}
