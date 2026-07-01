"use client";
import { Loader2 } from "lucide-react";

export default function MemberLoading() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground font-medium">Loading...</p>
    </div>
  );
}
