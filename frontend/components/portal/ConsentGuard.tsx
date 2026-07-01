"use client";

import { useEffect, useState } from "react";
import { CONSENT_VERSION, CONSENT_TEXT } from "@/lib/consent";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ConsentGuard({ children }: { children: React.ReactNode }) {
 const [hasConsented, setHasConsented] = useState<boolean | null>(null);
 const [isChecked, setIsChecked] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 async function checkConsent() {
 try {
 const res = await fetch("/api/consent");
 if (res.status === 401) {
 // If unauthorized, just pass through (maybe they are logging out or unauthenticated layouts)
 setHasConsented(true);
 return;
 }
 if (!res.ok) throw new Error("Failed to check consent status");
 const data = await res.json();
 setHasConsented(data.hasConsented);
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : "Unknown error");
 setHasConsented(false);
 }
 }
 checkConsent();
 }, []);

 const handleConsent = async () => {
 if (!isChecked) return;
 setIsSubmitting(true);
 try {
 const res = await fetch("/api/consent", { method: "POST" });
 if (!res.ok) throw new Error("Failed to record consent. Please try again.");
 toast.success("Consent recorded successfully.");
 setHasConsented(true);
 } catch (err: unknown) {
 toast.error(err instanceof Error ? err.message : "An error occurred");
 } finally {
 setIsSubmitting(false);
 }
 };

 if (hasConsented === null) {
 return (
 <div className="flex h-screen w-full items-center justify-center bg-background">
 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
 </div>
 );
 }

 if (hasConsented) {
 return <>{children}</>;
 }

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 overflow-y-auto">
 <div className="w-full max-w-2xl bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in slide-in-from-bottom-4">
 <div className="p-8 border-b border-white/5">
 <h1 className="font-display text-3xl font-medium">Terms & Consent</h1>
 <p className="text-sm text-muted-foreground mt-2">
 Please review the updated agreement to continue. Version {CONSENT_VERSION}
 </p>
 </div>
 
 <div className="p-8 bg-black/20 max-h-[50vh] overflow-y-auto font-mono text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap border-b border-white/5">
 {CONSENT_TEXT}
 </div>
 
 <div className="p-8 space-y-6">
 {error && <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}
 
 <label className="flex items-start gap-3 cursor-pointer group">
 <div className="mt-1 flex items-center justify-center h-5 w-5 rounded border border-white/20 bg-white/5 group-hover:border-[var(--vx-jade)] transition-colors shrink-0">
 <input
 type="checkbox"
 className="opacity-0 absolute"
 checked={isChecked}
 onChange={(e) => setIsChecked(e.target.checked)}
 />
 {isChecked && <div className="h-3 w-3 rounded-sm bg-[var(--vx-jade)]" />}
 </div>
 <span className="text-sm font-medium leading-tight">
 I confirm that I have read and understood the above consent and agree to proceed.
 </span>
 </label>
 
 <button
 onClick={handleConsent}
 disabled={!isChecked || isSubmitting}
 className="btn btn-primary w-full text-base disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
 {isSubmitting ? "Recording..." : "Continue to Portal"}
 </button>
 </div>
 </div>
 </div>
 );
}
