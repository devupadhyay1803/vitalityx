"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export default function SessionTimeout() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClient();

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(async () => {
      // Idle timeout reached
      await supabase.auth.signOut();
      router.push("/login?timeout=true");
    }, TIMEOUT_MS);
  }, [router, supabase]);

  useEffect(() => {
    // Start initial timer
    resetTimer();

    const events = ["mousemove", "keydown", "scroll", "touchstart"];
    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);

  return null; // Invisible component
}
