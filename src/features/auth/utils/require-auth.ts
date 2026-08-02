import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function requireAuth() {
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
