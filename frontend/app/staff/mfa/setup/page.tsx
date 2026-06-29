"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function MFASetupPage() {
  const [factorId, setFactorId] = useState("");
  const [qrCodeSvg, setQrCodeSvg] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function setupMFA() {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (error) {
        setError(error.message);
        return;
      }
      setFactorId(data.id);
      setQrCodeSvg(data.totp.qr_code);
    }
    setupMFA();
  }, [supabase]);

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
      router.push("/staff/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md vx-card p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Setup Staff Security</h1>
        <p className="text-muted-foreground text-sm mb-6 text-center">
          Because you handle sensitive health data, you must secure your account with an Authenticator app (like Google Authenticator or Authy).
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center mb-6 bg-white p-4 rounded-lg">
          {qrCodeSvg ? (
            <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} className="w-48 h-48" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-muted-foreground animate-pulse bg-muted rounded-md">
              Loading...
            </div>
          )}
        </div>

        <form onSubmit={onVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Enter 6-digit Code</label>
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="vx-input text-center text-xl tracking-[0.5em]"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || verifyCode.length !== 6}
            className="btn btn-jade w-full justify-center"
          >
            {loading ? "Verifying..." : "Verify & Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
