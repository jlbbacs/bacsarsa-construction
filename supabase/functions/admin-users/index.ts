// Single Edge Function handling every Super-Admin-only user-management
// action that requires the service_role key: create | resend-invite |
// delete | set-status | force-logout. Consolidated into one function
// (action discriminator in the request body) to minimize the number of
// `supabase functions deploy` commands and secrets the project owner has
// to manage by hand.
//
// Required secret (set via `supabase secrets set`): RESEND_API_KEY is NOT
// needed here -- this function never sends email itself, it only creates
// the auth.users row via inviteUserByEmail, which triggers Supabase's own
// invite email natively (no custom email step for account creation).
// SITE_URL should be set to the deployed frontend origin (e.g.
// https://your-site.vercel.app) so invite links point somewhere real; it
// defaults to http://localhost:5184 for local dev if unset.

import { corsHeaders } from "../_shared/cors.ts";
import { AuthzError, getServiceClient, requireSuperAdmin } from "../_shared/authz.ts";

type Action = "create" | "resend-invite" | "delete" | "set-status" | "force-logout";

type SetStatusTarget = "active" | "disabled" | "suspended" | "locked";

const BAN_STATUSES: SetStatusTarget[] = ["disabled", "suspended", "locked"];
// Supabase's admin API has no literal "permanent" ban duration; a 100-year
// duration is the community-standard stand-in, always reversible by
// setting ban_duration back to "none".
const PERMANENT_BAN_DURATION = "876000h";

function siteUrl(): string {
  return Deno.env.get("SITE_URL") ?? "http://localhost:5184";
}

async function logActivity(
  serviceClient: ReturnType<typeof getServiceClient>,
  actorUserId: string,
  action: string,
  targetUserId: string | null,
  metadata: Record<string, unknown> = {}
) {
  await serviceClient.from("activity_logs").insert({
    actor_user_id: actorUserId,
    action,
    target_user_id: targetUserId,
    metadata,
  });
}

async function handleCreate(req: Request, caller: Awaited<ReturnType<typeof requireSuperAdmin>>) {
  const body = await req.json();
  const { first_name, last_name, username, email, phone } = body as {
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    phone?: string;
  };

  if (!username || !email || !first_name || !last_name) {
    throw new AuthzError("First name, last name, username, and email are required.", 400);
  }

  const serviceClient = getServiceClient();

  const { data: existingUsername } = await serviceClient
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingUsername) {
    throw new AuthzError("That username is already taken.", 409);
  }

  // Role is always "admin" here -- creating a second Super Admin through
  // ordinary user creation isn't supported (see project plan: "Transfer
  // Super Admin ownership" is a separate, deferred, higher-risk flow).
  const { data: invited, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    data: { first_name, last_name, username, role: "admin", phone: phone ?? null },
    redirectTo: `${siteUrl()}/set-password`,
  });

  if (inviteError || !invited?.user) {
    throw new AuthzError(inviteError?.message ?? "Failed to invite user.", 400);
  }

  await logActivity(serviceClient, caller.userId, "user_created", invited.user.id, { email, username });

  return { user_id: invited.user.id };
}

async function handleResendInvite(req: Request, caller: Awaited<ReturnType<typeof requireSuperAdmin>>) {
  const { user_id } = (await req.json()) as { user_id?: string };
  if (!user_id) throw new AuthzError("user_id is required.", 400);

  const serviceClient = getServiceClient();

  const { data: existing, error: getError } = await serviceClient.auth.admin.getUserById(user_id);
  if (getError || !existing?.user?.email) {
    throw new AuthzError("User not found.", 404);
  }

  const { error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(existing.user.email, {
    data: existing.user.user_metadata,
    redirectTo: `${siteUrl()}/set-password`,
  });

  if (inviteError) {
    throw new AuthzError(inviteError.message, 400);
  }

  await logActivity(serviceClient, caller.userId, "invite_resent", user_id, { email: existing.user.email });

  return { ok: true };
}

async function handleDelete(req: Request, caller: Awaited<ReturnType<typeof requireSuperAdmin>>) {
  const { user_id } = (await req.json()) as { user_id?: string };
  if (!user_id) throw new AuthzError("user_id is required.", 400);

  if (user_id === caller.userId) {
    throw new AuthzError("You cannot delete your own account.", 400);
  }

  const serviceClient = getServiceClient();

  const { data: existing } = await serviceClient.auth.admin.getUserById(user_id);
  const { data: targetProfile } = await serviceClient.from("profiles").select("username").eq("id", user_id).maybeSingle();

  // Log BEFORE deleting: activity_logs.target_user_id has ON DELETE SET
  // NULL, so once the auth.users row is gone the FK column nulls itself
  // out -- the email/username snapshot in metadata is what keeps this
  // entry meaningful in the audit trail afterward.
  await logActivity(serviceClient, caller.userId, "user_deleted", user_id, {
    email: existing?.user?.email ?? null,
    username: targetProfile?.username ?? null,
  });

  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user_id);
  if (deleteError) {
    throw new AuthzError(deleteError.message, 400);
  }

  return { ok: true };
}

async function handleSetStatus(req: Request, caller: Awaited<ReturnType<typeof requireSuperAdmin>>) {
  const { user_id, status } = (await req.json()) as { user_id?: string; status?: SetStatusTarget };
  if (!user_id || !status) throw new AuthzError("user_id and status are required.", 400);

  if (user_id === caller.userId) {
    throw new AuthzError("You cannot change your own account status here.", 400);
  }

  const serviceClient = getServiceClient();
  const banDuration = BAN_STATUSES.includes(status) ? PERMANENT_BAN_DURATION : "none";

  const { error: banError } = await serviceClient.auth.admin.updateUserById(user_id, { ban_duration: banDuration });
  if (banError) {
    throw new AuthzError(banError.message, 400);
  }

  const profileUpdate: Record<string, unknown> = { status };
  if (status === "active") {
    profileUpdate.failed_attempts = 0;
    profileUpdate.locked_until = null;
  }

  const { error: profileErr } = await serviceClient.from("profiles").update(profileUpdate).eq("id", user_id);
  if (profileErr) {
    throw new AuthzError(profileErr.message, 400);
  }

  await logActivity(serviceClient, caller.userId, "status_changed", user_id, { new_status: status });

  return { ok: true };
}

async function handleForceLogout(req: Request, caller: Awaited<ReturnType<typeof requireSuperAdmin>>) {
  const { user_id } = (await req.json()) as { user_id?: string };
  if (!user_id) throw new AuthzError("user_id is required.", 400);

  const serviceClient = getServiceClient();

  const { error: signOutError } = await serviceClient.auth.admin.signOut(user_id, "global");
  if (signOutError) {
    throw new AuthzError(signOutError.message, 400);
  }

  await logActivity(serviceClient, caller.userId, "force_logout", user_id, {});

  return { ok: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = (url.searchParams.get("action") ?? "") as Action;
    const caller = await requireSuperAdmin(req);

    let result: unknown;
    switch (action) {
      case "create":
        result = await handleCreate(req, caller);
        break;
      case "resend-invite":
        result = await handleResendInvite(req, caller);
        break;
      case "delete":
        result = await handleDelete(req, caller);
        break;
      case "set-status":
        result = await handleSetStatus(req, caller);
        break;
      case "force-logout":
        result = await handleForceLogout(req, caller);
        break;
      default:
        throw new AuthzError(`Unknown action "${action}".`, 400);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const status = err instanceof AuthzError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
