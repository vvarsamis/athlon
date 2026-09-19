import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { getProfile, homePathFor, type UserRole } from "./profile";

// Server-side role gate: κρατά τους πελάτες μακριά από trainer-only pages
// και τους trainers από client-only pages. Αγνοεί anonymous users (τους
// χειρίζεται το proxy που στέλνει στο /login).
export async function requireRole(required: UserRole): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const profile = await getProfile(supabase, user.id);
  if (profile && profile.user_type !== required) {
    redirect(homePathFor(profile.user_type));
  }
}
