/**
 * Seed an application user the standard way: create the auth user via GoTrue
 * (supabase.auth.signUp) so Supabase owns the auth.users / auth.identities rows,
 * then create the matching user_profiles row via the same backend service the
 * app uses on first login (createUserProfile).
 *
 * Idempotent: re-running detects the existing profile/auth user and makes no
 * changes.
 *
 * Requires "Confirm email" to be DISABLED in the hosted project's Auth settings
 * (the script detects and reports if it is still enabled).
 *
 * Usage:
 *   pnpm --filter web seed:users
 *   SEED_USER_EMAIL=a@b.com SEED_USER_PASSWORD=... SEED_USER_NAME="Dr X" pnpm --filter web seed:users
 */
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { SUPABASE_URL } from "../../constants";
import { db, queryClient } from "../client";
import { UserProfilesTable } from "../schemas";
import {
  createUserProfile,
  getUserProfileByEmail,
} from "../../services/user_profile";

const email = process.env.SEED_USER_EMAIL || "doctor@augenai.dev";
const password = process.env.SEED_USER_PASSWORD || "AugenAI!2026";
const name = process.env.SEED_USER_NAME || "Demo Doctor";
const role = process.env.SEED_USER_ROLE || "doctor";

const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

async function finish(code: number): Promise<never> {
  await queryClient.end({ timeout: 5 }).catch(() => {});
  process.exit(code);
}

async function main() {
  if (!publishableKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is not set — cannot create the public Supabase client.",
    );
    return finish(1);
  }

  // 1. Idempotency: a profile already means this user is fully seeded.
  const existingProfile = await getUserProfileByEmail({ email });
  if (existingProfile) {
    console.log(`✓ user already seeded: ${email} (no changes)`);
    return finish(0);
  }

  const supabase = createClient(SUPABASE_URL, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 2. Create the auth user via the standard GoTrue sign-up flow.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (signUpError && !/already registered/i.test(signUpError.message)) {
    console.error("signUp failed:", signUpError.message);
    return finish(1);
  }
  if (signUpError) {
    console.log(`• auth user already exists for ${email} — ensuring profile…`);
  } else {
    console.log(`• created auth user via signUp: ${email}`);
  }

  // 3. Obtain a session token (sign-up may not return one).
  let accessToken = signUpData?.session?.access_token;
  let userId = signUpData?.user?.id;

  if (!accessToken) {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      if (/email not confirmed/i.test(signInError.message)) {
        console.error(
          "✖ The user was created but cannot sign in because email confirmation is ON.\n" +
            "  Disable it in Supabase → Authentication → Sign In / Providers → 'Confirm email',\n" +
            "  then re-run this seed.",
        );
        return finish(1);
      }
      console.error("signInWithPassword failed:", signInError.message);
      return finish(1);
    }
    accessToken = signInData.session?.access_token;
    userId = signInData.user?.id;
  }

  // 4. Create the user_profiles row via the standard backend service.
  try {
    if (!accessToken) throw new Error("no access token available");
    await createUserProfile(accessToken, { name });
    console.log("• created user_profiles via createUserProfile()");
  } catch (e) {
    // Fallback: insert the same row directly if JWT verification is unavailable.
    console.warn(
      `• createUserProfile() unavailable (${e instanceof Error ? e.message : e}); inserting profile directly`,
    );
    if (!userId) {
      console.error("✖ cannot create profile: no auth user id resolved");
      return finish(1);
    }
    await db
      .insert(UserProfilesTable)
      .values({ id: userId, email, name, role })
      .onConflictDoNothing();
  }

  // Honour a non-default role even when createUserProfile applied the default.
  if (role !== "doctor") {
    const profile = await getUserProfileByEmail({ email });
    if (profile && profile.role !== role) {
      await db
        .update(UserProfilesTable)
        .set({ role })
        .where(eq(UserProfilesTable.id, profile.id));
    }
  }

  console.log(`✓ seeded user: ${email} (role=${role})`);
  return finish(0);
}

main().catch((e) => {
  console.error("seed:users failed:", e);
  return finish(1);
});
