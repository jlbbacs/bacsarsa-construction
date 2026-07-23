// deno-lint-ignore-file no-explicit-any
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

// SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are
// automatically injected into every Edge Function by the platform -- no
// manual `supabase secrets set` needed for these three.

export function getServiceClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Forwards the caller's own Authorization header so .auth.getUser() and any
// RLS-governed query resolves as *them*, not as the service role.
export function getCallerClient(req: Request): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export class AuthzError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export interface CallerProfile {
  id: string;
  role: "super_admin" | "admin";
  status: string;
  username: string;
}

export async function requireSuperAdmin(req: Request): Promise<{ userId: string; email: string; profile: CallerProfile }> {
  const callerClient = getCallerClient(req);
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    throw new AuthzError("Not authenticated.", 401);
  }

  const { data: profile, error: profileError } = await callerClient
    .from("profiles")
    .select("id, role, status, username")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile) {
    throw new AuthzError("No profile found for this account.", 403);
  }

  if ((profile as CallerProfile).role !== "super_admin") {
    throw new AuthzError("Only a Super Admin can perform this action.", 403);
  }

  return { userId: userData.user.id, email: userData.user.email ?? "", profile: profile as CallerProfile };
}

export async function requireAuthenticated(req: Request): Promise<{ userId: string; email: string }> {
  const callerClient = getCallerClient(req);
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    throw new AuthzError("Not authenticated.", 401);
  }
  return { userId: userData.user.id, email: userData.user.email ?? "" };
}
