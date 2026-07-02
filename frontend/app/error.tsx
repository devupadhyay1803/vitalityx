"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-destructive/10 blur-xl"></div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-card border border-destructive/20 shadow-sm">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>
      <h2 className="font-display text-3xl font-semibold tracking-tight mb-2">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        We encountered an unexpected error while trying to load this page. Our team has been notified.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={() => reset()}
          className="btn btn-outline"
        >
          Try again
        </button>
        <Link href="/" className="btn btn-primary">
          Return Home
        </Link>
      </div>
    </div>
  );
}
