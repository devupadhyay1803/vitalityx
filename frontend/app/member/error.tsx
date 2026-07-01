"use client";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function MemberError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 return (
 <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
 <div className="mb-6 rounded-full bg-destructive/10 p-4">
 <AlertTriangle className="h-10 w-10 text-destructive" />
 </div>
 <h2 className="font-display text-2xl font-medium mb-2">Something went wrong!</h2>
 <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
 We encountered an error while loading this page. Please try again or contact support if the issue persists.
 </p>
 <button onClick={() => reset()} className="btn btn-outline flex items-center gap-2">
 <RefreshCw size={16} /> Try again
 </button>
 </div>
 );
}
