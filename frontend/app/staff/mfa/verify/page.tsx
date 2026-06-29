"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function MFAVerifyPage() {
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/staff/dashboard";

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadFactors() {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        setError(error.message);
        return;
      }
      
      const totpFactor = data.totp[0];
      if (!totpFactor) {
        router.push("/staff/mfa/setup");
        return;
      }
      setFactorId(totpFactor.id);
    }
    loadFactors();
  }, [supabase, router]);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      setError(challenge.error.message);
      setLoading(false);
      return;
    }

    const challengeId = challenge.data.id;
    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: verifyCode,
    });

    if (verify.error) {
      setError(verify.error.message);
      setLoading(false);
    } else {
      router.push(nextUrl);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md vx-card p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Staff Security Verification</h1>
        <p className="text-muted-foreground text-sm mb-6 text-center">
          Please enter the 6-digit code from your Authenticator app.
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={onVerify} className="space-y-4">
          <div>
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="vx-input text-center text-xl tracking-[0.5em]"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading || verifyCode.length !== 6}
            className="btn btn-jade w-full justify-center"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
