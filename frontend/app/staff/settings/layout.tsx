import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return redirect("/login");

 const { data: profile } = await supabase
 .from("profiles")
 .select("role")
 .eq("id", user.id)
 .single();

 const adminRoles = ["Admin", "Super Admin", "Operations"];
 if (!profile || !adminRoles.includes(profile.role)) {
 return redirect("/staff/dashboard");
 }

 return <>{children}</>;
}
