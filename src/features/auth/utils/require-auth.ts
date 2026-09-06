import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { DEMO_AUTH_COOKIE, getDemoSessionId } from "@/lib/demo-session";

export async function requireAuth() {
  const cookieStore = await cookies();
  const isDemoAuth = cookieStore.get(DEMO_AUTH_COOKIE)?.value === "true";

  if (isDemoAuth) {
    const sessionId = await getDemoSessionId();
    const admin = createAdminClient();

    let { data: profile } = await admin
      .from("profiles_demo")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (!profile) {
      await admin.rpc("seed_demo_session", { p_session_id: sessionId });
      const seeded = await admin
        .from("profiles_demo")
        .select("*")
        .eq("session_id", sessionId)
        .single();
      profile = seeded.data;
    }

    if (profile) {
      const demoUser = {
        id: profile.id,
        app_metadata: {},
        user_metadata: {
          full_name: `${profile.first_name ?? "Mario"} ${profile.last_name ?? "Rossi"}`.trim(),
        },
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: profile.email || "mario.rossi@edubook.it",
      } as unknown as User;

      return {
        user: demoUser,
        profile,
      };
    }
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/?auth=login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const allowedRoles = ["admin", "professor", "superadmin"];
  if (profileError || !profile || !allowedRoles.includes(profile.role)) {
    await supabase.auth.signOut();
    redirect("/?auth=login");
  }

  return { user, profile };
}
