"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CONSENT_TEXT, CONSENT_VERSION } from "@/lib/consent";
import { getInitials } from "@/lib/utils";

type Draft = {
 full_name?: string;
 email?: string;
 dob?: string;
 biological_sex?: string;
 health_goal?: string;
 medications?: string;
 conditions?: string[];
 sleep_hours?: number;
 exercise_days?: number;
 smoking?: string;
 alcohol?: string;
};

const STORAGE_KEY = "vx_signup_draft";
const STEP_KEY = "vx_signup_step";
const STEPS = ["Account", "Profile", "Intake", "Consent", "Your Team"];

export default function SignupPage() {
 const router = useRouter();
 const [step, setStep] = useState(1);
 const [draft, setDraft] = useState<Draft>({});
 const [coach, setCoach] = useState<{ id: string; full_name: string | null; role: string } | null>(null);
 const [busy, setBusy] = useState(false);

 useEffect(() => {
 const d = localStorage.getItem(STORAGE_KEY);
 const s = localStorage.getItem(STEP_KEY);
 if (d) { try { setDraft(JSON.parse(d)); } catch {} }
 if (s) setStep(parseInt(s));
 }, []);
 useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); }, [draft]);
 useEffect(() => { localStorage.setItem(STEP_KEY, String(step)); }, [step]);

 // ── Step 1: signup ──
 async function submitStep1(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 const f = new FormData(e.currentTarget);
 const full_name = (f.get("full_name") as string).trim();
 const email = (f.get("email") as string).trim();
 const password = f.get("password") as string;
 const confirm = f.get("confirm") as string;
 if (password.length < 8) return toast.error("Password must be ≥ 8 characters.");
 if (password !== confirm) return toast.error("Passwords don't match.");

 setBusy(true);
 const supabase = createClient();
 const { error, data: signUpData } = await supabase.auth.signUp({
 email, password,
 options: {
 data: { full_name, role: "Member" },
 emailRedirectTo: `${window.location.origin}/auth/callback`,
 },
 });
 if (error) { setBusy(false); return toast.error(error.message); }

 // Sign in (handles projects without email confirmation)
 let { data: sess } = await supabase.auth.getSession();
 if (!sess.session) {
 const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
 if (signInErr) { setBusy(false); return toast.error(signInErr.message); }
 ({ data: sess } = await supabase.auth.getSession());
 }

 // Create profile + client_record manually (trigger was removed for stability)
 const userId = sess.session?.user.id || signUpData?.user?.id;
 if (userId) {
 await supabase.from("profiles").upsert({ id: userId, full_name, email, role: "Member" }, { onConflict: "id" });
 await supabase.from("client_records").upsert({ member_id: userId }, { onConflict: "member_id" });
 }

 setBusy(false);
 setDraft((d) => ({ ...d, full_name, email }));
 setStep(2);
 }

 // ── Step 2: profile ──
 async function submitStep2(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 const f = new FormData(e.currentTarget);
 const dob = f.get("dob") as string;
 const biological_sex = f.get("biological_sex") as string;
 const health_goal = f.get("health_goal") as string;

 setBusy(true);
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) { setBusy(false); return toast.error("Session lost — please refresh."); }
 const { error } = await supabase.from("profiles").update({ dob, biological_sex, health_goal }).eq("id", user.id);
 setBusy(false);
 if (error) return toast.error(error.message);
 setDraft((d) => ({ ...d, dob, biological_sex, health_goal }));
 setStep(3);
 }

 // ── Step 3: intake ──
 async function submitStep3(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 const f = new FormData(e.currentTarget);
 const intake = {
 medications: (f.get("medications") as string) || "",
 conditions: f.getAll("conditions") as string[],
 sleep_hours: Number(f.get("sleep_hours")),
 exercise_days: Number(f.get("exercise_days")),
 smoking: f.get("smoking") as string,
 alcohol: f.get("alcohol") as string,
 };
 setBusy(true);
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) { setBusy(false); return toast.error("Session lost — please refresh."); }
 const { error } = await supabase.from("client_records").update({ intake }).eq("member_id", user.id);
 setBusy(false);
 if (error) return toast.error(error.message);
 setStep(4);
 }

 // ── Step 4: consent ──
 async function submitStep4(signatureName: string) {
 setBusy(true);
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) { setBusy(false); return toast.error("Session lost — please refresh."); }
 
 // We store the signature in the intake JSON to avoid schema conflicts,
 // alongside the top-level consented flags.
 const { data: record } = await supabase.from("client_records").select("intake").eq("member_id", user.id).single();
 const currentIntake = record?.intake || {};
 
 const { error } = await supabase.from("client_records").update({
 consented: true,
 consented_at: new Date().toISOString(),
 consent_version: CONSENT_VERSION,
 intake: {
 ...currentIntake,
 consent_signature: signatureName,
 consent_timestamp: new Date().toISOString(),
 }
 }).eq("member_id", user.id);

 if (!error) {
 // Also write to consent_records so ConsentGuard recognizes it
 await supabase.from("consent_records").insert({
 user_id: user.id,
 consent_version: CONSENT_VERSION,
 consent_text: CONSENT_TEXT,
 ip_address: "signup",
 user_agent: navigator.userAgent
 });
 }

 setBusy(false);
 if (error) return toast.error(error.message);
 setStep(5);
 }

 // ── Step 5: meet team ──
 useEffect(() => {
 if (step !== 5) return;
 const supabase = createClient();
 (async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;
 const { data: coaches } = await supabase
 .from("profiles")
 .select("id, full_name, role")
 .eq("role", "Coach")
 .limit(1);
 const c = coaches?.[0];
 if (c) {
 setCoach(c);
 await supabase.from("client_records").update({ assigned_coach_id: c.id }).eq("member_id", user.id);
 }
 })();
 }, [step]);

 function finish() {
 localStorage.removeItem(STORAGE_KEY);
 localStorage.removeItem(STEP_KEY);
 router.push("/member/dashboard");
 router.refresh();
 }

 return (
 <div className="mx-auto min-h-[calc(100vh-80px)] max-w-2xl px-6 py-12">
 <ProgressBar step={step} />

 <div className="mt-10" data-testid={`signup-step-${step}`}>
 {step === 1 && (
 <>
 <h1 className="font-display text-4xl font-medium tracking-tight">Create your account</h1>
 <p className="mt-2 text-muted-foreground">Step 1 of 5</p>
 <form onSubmit={submitStep1} className="mt-8 space-y-4">
 <Field label="Full name"><input name="full_name" required defaultValue={draft.full_name || ""} className="vx-input" data-testid="signup-full-name" /></Field>
 <Field label="Email"><input name="email" type="email" required defaultValue={draft.email || ""} className="vx-input" data-testid="signup-email" /></Field>
 <Field label="Password (min 8 chars)"><input name="password" type="password" required minLength={8} className="vx-input" data-testid="signup-password" /></Field>
 <Field label="Confirm password"><input name="confirm" type="password" required minLength={8} className="vx-input" data-testid="signup-confirm" /></Field>
 <button type="submit" disabled={busy} data-testid="signup-step1-submit" className="btn btn-primary w-full">
 {busy ? "Creating…" : "Continue"}
 </button>
 <p className="pt-2 text-center text-sm text-muted-foreground">
 Already a member? <Link href="/login" className="font-medium underline">Sign in</Link>
 </p>
 </form>
 </>
 )}

 {step === 2 && (
 <>
 <h1 className="font-display text-4xl font-medium tracking-tight">Tell us about you</h1>
 <p className="mt-2 text-muted-foreground">Step 2 of 5</p>
 <form onSubmit={submitStep2} className="mt-8 space-y-4">
 <Field label="Date of birth"><input name="dob" type="date" required defaultValue={draft.dob} className="vx-input" data-testid="signup-dob" /></Field>
 <Field label="Biological sex">
 <select name="biological_sex" required defaultValue={draft.biological_sex || ""} className="vx-input" data-testid="signup-sex">
 <option value="" disabled>Select…</option><option>Female</option><option>Male</option><option>Intersex</option><option>Prefer not to say</option>
 </select>
 </Field>
 <Field label="Primary health goal">
 <select name="health_goal" required defaultValue={draft.health_goal || ""} className="vx-input" data-testid="signup-goal">
 <option value="" disabled>Select…</option>
 <option>Longevity</option><option>Performance</option><option>Weight</option><option>Cognitive</option><option>General Wellness</option>
 </select>
 </Field>
 <NavRow onBack={() => setStep(1)} busy={busy} ctaTestId="signup-step2-submit" />
 </form>
 </>
 )}

 {step === 3 && (
 <>
 <h1 className="font-display text-4xl font-medium tracking-tight">Quick intake</h1>
 <p className="mt-2 text-muted-foreground">Step 3 of 5 · This guides your initial protocol.</p>
 <form onSubmit={submitStep3} className="mt-8 space-y-5">
 <Field label="Current medications"><textarea name="medications" rows={2} className="vx-input" placeholder="e.g. atorvastatin 10mg, none" data-testid="signup-medications" /></Field>
 <Field label="Known conditions (check all that apply)">
 <div className="grid grid-cols-2 gap-2 text-sm" data-testid="signup-conditions">
 {["Hypertension", "Diabetes", "Thyroid", "Cardiovascular", "Autoimmune", "Anxiety/Depression", "Sleep apnea", "None"].map((c) => (
 <label key={c} className="flex items-center gap-2 rounded-md border border-border px-3 py-2"><input type="checkbox" name="conditions" value={c} />{c}</label>
 ))}
 </div>
 </Field>
 <SliderField label="Sleep hours / night" name="sleep_hours" min={4} max={10} defaultValue={7} testId="signup-sleep" />
 <SliderField label="Exercise days / week" name="exercise_days" min={0} max={7} defaultValue={3} testId="signup-exercise" />
 <Field label="Smoking"><select name="smoking" defaultValue="No" className="vx-input" data-testid="signup-smoking"><option>No</option><option>Yes</option></select></Field>
 <Field label="Alcohol"><select name="alcohol" defaultValue="Social" className="vx-input" data-testid="signup-alcohol"><option>None</option><option>Social</option><option>Regular</option></select></Field>
 <NavRow onBack={() => setStep(2)} busy={busy} ctaTestId="signup-step3-submit" />
 </form>
 </>
 )}

 {step === 4 && (
 <>
 <h1 className="font-display text-4xl font-medium tracking-tight">Service agreement</h1>
 <p className="mt-2 text-muted-foreground">Step 4 of 5</p>
 <div data-testid="signup-consent-text" className="mt-6 max-h-80 overflow-y-auto vx-card p-6 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
 {CONSENT_TEXT}
 </div>
 <ConsentCheckbox onAccept={submitStep4} busy={busy} onBack={() => setStep(3)} expectedName={draft.full_name || ""} />
 </>
 )}

 {step === 5 && (
 <>
 <h1 className="font-display text-4xl font-medium tracking-tight">Meet your coach</h1>
 <p className="mt-2 text-muted-foreground">Step 5 of 5 · You&apos;re all set.</p>
 <div data-testid="signup-team-card" className="mt-8 vx-card p-6 text-center">
 <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--vx-jade)]/20 text-2xl font-medium text-[var(--vx-ink)]">
 {getInitials(coach?.full_name)}
 </div>
 <h2 className="mt-4 font-display text-2xl">{coach?.full_name || "Your coach"}</h2>
 <p className="text-sm text-muted-foreground">Lead Health Coach · VitalityX</p>
 <p className="mt-5 text-sm text-muted-foreground">
 They&apos;ll review your intake within one business day and reach out to schedule your kickoff call.
 </p>
 </div>
 <button data-testid="signup-finish" onClick={finish} className="btn btn-primary mt-8 w-full">Go to Dashboard →</button>
 </>
 )}
 </div>
 </div>
 );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
 return (
 <div>
 <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
 {children}
 </div>
 );
}
function SliderField({ label, name, min, max, defaultValue, testId }: { label: string; name: string; min: number; max: number; defaultValue: number; testId?: string }) {
 const [v, setV] = useState(defaultValue);
 return (
 <div>
 <div className="mb-1.5 flex items-center justify-between">
 <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
 <span className="font-mono text-sm">{v}</span>
 </div>
 <input type="range" name={name} min={min} max={max} value={v} onChange={(e) => setV(Number(e.target.value))} className="w-full accent-[var(--vx-jade)]" data-testid={testId} />
 </div>
 );
}
function NavRow({ onBack, busy, ctaTestId }: { onBack: () => void; busy: boolean; ctaTestId?: string }) {
 return (
 <div className="flex items-center justify-between pt-2">
 <button type="button" onClick={onBack} className="btn btn-ghost" data-testid="signup-back">← Back</button>
 <button type="submit" disabled={busy} className="btn btn-primary" data-testid={ctaTestId}>{busy ? "Saving…" : "Continue →"}</button>
 </div>
 );
}
function ConsentCheckbox({ onAccept, busy, onBack, expectedName }: { onAccept: (sig: string) => void; busy: boolean; onBack: () => void; expectedName: string }) {
 const [checked, setChecked] = useState(false);
 const [signature, setSignature] = useState("");
 
 const isValid = checked && signature.trim().toLowerCase() === expectedName.trim().toLowerCase() && signature.length > 0;

 return (
 <div className="mt-6 space-y-4">
 <label className="flex cursor-pointer items-start gap-3 vx-card p-4 hover:border-[var(--vx-jade)] transition-colors">
 <input type="checkbox" data-testid="signup-consent-checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border accent-[var(--vx-jade)]" />
 <span className="text-sm">I have read and agree to the VitalityX Service Agreement, including its disclaimers about medical care, and I consent to telehealth services.</span>
 </label>
 
 <div className=" vx-card p-4">
 <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Electronic Signature</label>
 <p className="text-xs text-muted-foreground mb-3">Please type your full legal name (<strong className="text-foreground">{expectedName}</strong>) to electronically sign this agreement.</p>
 <input 
 type="text" 
 value={signature} 
 onChange={(e) => setSignature(e.target.value)} 
 placeholder="Type your full name" 
 className="vx-input font-display text-lg"
 data-testid="signup-consent-signature"
 />
 </div>

 <div className="mt-6 flex items-center justify-between pt-2">
 <button onClick={onBack} className="btn btn-ghost" data-testid="signup-back">← Back</button>
 <button onClick={() => onAccept(signature)} disabled={!isValid || busy} data-testid="signup-step4-submit" className="btn btn-primary">
 {busy ? "Saving…" : "Sign & Continue →"}
 </button>
 </div>
 </div>
 );
}
function ProgressBar({ step }: { step: number }) {
 return (
 <div className="flex items-center gap-2">
 {STEPS.map((label, i) => {
 const n = i + 1;
 const done = n < step, active = n === step;
 return (
 <div key={label} className="flex flex-1 items-center gap-2">
 <div className={`h-1.5 flex-1 rounded-full ${done || active ? "bg-[var(--vx-ink)]" : "bg-muted"}`} />
 {n < STEPS.length && <span className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:inline">{label}</span>}
 </div>
 );
 })}
 </div>
 );
}
