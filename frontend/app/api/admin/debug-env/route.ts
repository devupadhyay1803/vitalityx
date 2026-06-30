import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const envs: Record<string, string | undefined> = {};
  for (const key of Object.keys(process.env)) {
    if (key.includes("POSTGRES") || key.includes("SUPABASE") || key.includes("STRIPE") || key.includes("SECRET")) {
      envs[key] = process.env[key];
    }
  }
  return NextResponse.json(envs);
}
