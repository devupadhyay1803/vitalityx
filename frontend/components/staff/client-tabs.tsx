"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ClientTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const tabs = [
    { name: "Overview", path: `/staff/clients/${id}` },
    { name: "Timeline", path: `/staff/clients/${id}/timeline` },
    { name: "Labs", path: `/staff/clients/${id}/labs` },
    { name: "Protocol", path: `/staff/clients/${id}/protocol` },
    { name: "Notes", path: `/staff/clients/${id}/notes` },
    { name: "Documents", path: `/staff/clients/${id}/documents` },
    { name: "Messages", path: `/staff/clients/${id}/messages` },
  ];

  return (
    <div className="mt-6 flex gap-4 border-b border-border pb-2 text-sm overflow-x-auto mb-6">
      {tabs.map((t) => {
        const isActive = pathname === t.path;
        return (
          <Link 
            key={t.name} 
            href={t.path} 
            className={`whitespace-nowrap px-1 pb-2 ${isActive ? "font-medium text-[var(--vx-ink)] border-b-2 border-[var(--vx-ink)]" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.name}
          </Link>
        );
      })}
    </div>
  );
}
