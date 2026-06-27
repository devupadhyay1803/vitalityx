import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: `probe-${Date.now()}@vitalityx-test.local`,
    password: "ProbeTest1234!",
    email_confirm: true,
    user_metadata: { full_name: "Probe Test", role: "Member" },
  });
  return NextResponse.json({
    data,
    error: error
      ? { name: error.name, status: (error as any).status, code: (error as any).code, message: error.message, stack: error.stack?.split("\n").slice(0, 4) }
      : null,
  });
}
