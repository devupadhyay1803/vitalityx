import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ClientDetailsLayout({
 children,
 params,
}: {
 children: React.ReactNode;
 params: Promise<{ id: string }>;
}) {
 const { id } = await params;
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return redirect("/login");

 const { data: profile } = await supabase
 .from("profiles")
 .select("role")
 .eq("id", user.id)
 .single();

 if (!profile) return redirect("/staff/dashboard");

 // Admins & Operations can see all clients
 const adminRoles = ["Admin", "Super Admin", "Operations"];
 if (adminRoles.includes(profile.role)) {
 return <>{children}</>;
 }

 // Regular staff must be explicitly assigned to this member
 const { data: assignment } = await supabase
 .from("care_team_assignments")
 .select("id")
 .eq("staff_id", user.id)
 .eq("member_id", id)
 .maybeSingle();

 if (!assignment) {
 return redirect("/staff/clients"); // Unauthorized to view this client
 }

 return <>{children}</>;
}
