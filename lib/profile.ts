import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "client" | "trainer";

export type Profile = {
  id: string;
  user_type: UserRole;
  full_name: string | null;
  avatar_url: string | null;
};

export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_type, full_name, avatar_url")
    .eq("id", userId)
    .single();

  if (error) {
    console.warn("[profile] failed to fetch:", error.message);
    return null;
  }
  return data as Profile;
}

export function homePathFor(role: UserRole): string {
  return role === "trainer" ? "/trainer" : "/home";
}
