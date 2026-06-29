import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalShell } from "@/components/portal/portal-shell";
import { ConsentGuard } from "@/components/portal/ConsentGuard";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/member/dashboard");
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile && profile.role !== "Member") redirect("/staff/dashboard");
  
  return (
    <PortalShell variant="member" user={{ id: user.id, email: user.email || "" }} profile={profile || { full_name: null, role: "Member" }}>
      <ConsentGuard>
        {children}
      </ConsentGuard>
    </PortalShell>
  );
}
