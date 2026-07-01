import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth Callback Route
 * 
 * Supabase sends users here after email confirmation (signup) and
 * password reset. The URL contains a `code` query parameter that
 * must be exchanged for a session before the user can proceed.
 * 
 * Without this route, the PKCE code is never exchanged and the
 * user sees an "invalid key" error.
 */
export async function GET(request: Request) {
 const { searchParams, origin } = new URL(request.url);
 const code = searchParams.get("code");
 // "next" param lets callers control the post-auth destination
 const next = searchParams.get("next") ?? "/member/dashboard";

 if (code) {
 const supabase = await createClient();
 const { error } = await supabase.auth.exchangeCodeForSession(code);
 if (!error) {
 // For password reset, redirect to the reset-password page
 // so the user can set their new password.
 const type = searchParams.get("type");
 if (type === "recovery") {
 return NextResponse.redirect(`${origin}/reset-password`);
 }
 return NextResponse.redirect(`${origin}${next}`);
 }
 }

 // If code exchange failed, redirect to an error page or login
 return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
