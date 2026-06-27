import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const MEMBER_PREFIX = "/member";
const STAFF_PREFIX = "/staff";
const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isMember = path.startsWith(MEMBER_PREFIX);
  const isStaff = path.startsWith(STAFF_PREFIX);

  // Redirect unauthenticated users away from protected areas
  if ((isMember || isStaff) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  // Role-based routing
  if (user && (isMember || isStaff)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role || "Member";

    if (isMember && role !== "Member") {
      const url = request.nextUrl.clone();
      url.pathname = "/staff/dashboard";
      return NextResponse.redirect(url);
    }
    if (isStaff && role === "Member") {
      const url = request.nextUrl.clone();
      url.pathname = "/member/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from /login + /signup
  if (user && AUTH_PAGES.includes(path) && path !== "/reset-password") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const dest = profile?.role === "Member" ? "/member/dashboard" : "/staff/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
