import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalShell } from "@/components/portal/portal-shell";

import SessionTimeout from "@/components/staff/SessionTimeout";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) redirect("/login?redirectTo=/staff/dashboard");
 const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
 const allowedRoles = ["Physician", "Health Coach", "Coach", "Nutritionist", "Lab Coordinator", "Operations", "Ops", "Admin", "Super Admin"];
 if (!profile || !allowedRoles.includes(profile.role)) redirect("/member/dashboard");
 return (
 <>
 <SessionTimeout />
 <PortalShell variant="staff" user={{ id: user.id, email: user.email || "" }} profile={profile}>
 {children}
 </PortalShell>
 </>
 );
}
