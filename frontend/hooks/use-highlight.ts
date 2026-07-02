"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function useHighlight(availableIds: string[] = []) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const highlightId = searchParams.get("highlight");

  useEffect(() => {
    if (!highlightId) return;

    // We delay the highlight slightly to allow for data loading/rendering
    const timeoutId = setTimeout(() => {
      const element = document.getElementById(highlightId);

      if (element) {
        // Element found, scroll to it and highlight
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight-flash");
        
        // Remove the highlight class after animation finishes (3s)
        setTimeout(() => {
          if (element) element.classList.remove("highlight-flash");
        }, 3000);
      } else if (availableIds.length > 0 && !availableIds.includes(highlightId)) {
        // Element not found and we have a definitive list of IDs
        toast.info("This notification refers to an item that is no longer available.");
      }

      // Clean up the URL parameter without causing a full page reload or scroll jump
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("highlight");
      const newUrl = newSearchParams.toString() ? `${pathname}?${newSearchParams.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 500); // 500ms delay to allow DOM to settle

    return () => clearTimeout(timeoutId);
  }, [highlightId, pathname, router, searchParams, availableIds]);
}
