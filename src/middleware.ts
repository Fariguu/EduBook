import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);

  const url = request.nextUrl.clone();

  // Route protection logic
  if (url.pathname.startsWith("/dashboard")) {
    // If not logged in, redirect to homepage with auth modal query param
    if (!user) {
      url.pathname = "/";
      url.searchParams.set("auth", "login");
      return NextResponse.redirect(url);
    }

    // Check role in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowedRoles = ["admin", "professor", "superadmin"];
    if (!profile || !allowedRoles.includes(profile.role)) {
      // Sign out unauthorized user and redirect
      await supabase.auth.signOut();
      url.pathname = "/";
      url.searchParams.set("auth", "login");
      const redirectResponse = NextResponse.redirect(url);
      // Copy cookies from refreshed session response to remove session cookie
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
