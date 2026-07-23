// Sends the two custom security emails this project needs beyond what
// Supabase Auth already sends natively (invite, password recovery):
// username-change confirmation links and Super-Admin OTP codes.
//
// Required secrets (set via `supabase secrets set`):
//   RESEND_API_KEY    -- from resend.com
//   RESEND_FROM_EMAIL -- must be on a domain verified in your Resend account,
//                        e.g. "Bacsarsa Construction <no-reply@yourdomain.com>"
// Optional: SITE_URL -- deployed frontend origin, defaults to localhost.
//
// The caller must be authenticated and must own the token being emailed
// about (token.user_id === caller.userId) -- this function will not email
// on behalf of a token_id belonging to someone else, so it can't be used
// to spam arbitrary users even though it doesn't require Super Admin.
//
// For type = "otp_superadmin", the raw 6-digit code is never stored in the
// database (only its hash is, for later verification) -- the client must
// pass it back in `raw_secret` immediately after the code-generating RPC
// returns it, so this function has something to actually put in the email.

import { corsHeaders } from "../_shared/cors.ts";
import { AuthzError, getServiceClient, requireAuthenticated } from "../_shared/authz.ts";

function siteUrl(): string {
  return Deno.env.get("SITE_URL") ?? "http://localhost:5184";
}

interface TokenRow {
  id: string;
  user_id: string;
  type: "username_change" | "email_change" | "otp_superadmin";
  token: string | null;
  new_value: string | null;
  expires_at: string;
  used_at: string | null;
}

function buildEmail(token: TokenRow, rawSecret: string | undefined): { subject: string; html: string } {
  if (token.type === "otp_superadmin") {
    if (!rawSecret) {
      throw new AuthzError("raw_secret is required for otp_superadmin emails.", 400);
    }
    return {
      subject: "Your verification code",
      html: `<p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px;">${rawSecret}</p><p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
    };
  }

  if (token.type === "username_change") {
    const link = `${siteUrl()}/confirm-change?token=${encodeURIComponent(token.token ?? "")}`;
    return {
      subject: "Confirm your username change",
      html: `<p>You requested to change your username to <strong>${token.new_value}</strong>.</p><p><a href="${link}">Click here to confirm this change</a>. This link expires in 24 hours.</p><p>If you didn't request this, you can ignore this email -- your username will not change.</p>`,
    };
  }

  throw new AuthzError(`Unsupported token type "${token.type}".`, 400);
}

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!apiKey || !from) {
    throw new AuthzError("Email is not configured (missing RESEND_API_KEY/RESEND_FROM_EMAIL secrets).", 500);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new AuthzError(`Resend API error: ${errText}`, 502);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const caller = await requireAuthenticated(req);
    const { token_id, raw_secret } = (await req.json()) as { token_id?: string; raw_secret?: string };

    if (!token_id) {
      throw new AuthzError("token_id is required.", 400);
    }

    const serviceClient = getServiceClient();

    const { data: token, error: tokenError } = await serviceClient
      .from("verification_tokens")
      .select("id, user_id, type, token, new_value, expires_at, used_at")
      .eq("id", token_id)
      .single();

    if (tokenError || !token) {
      throw new AuthzError("Token not found.", 404);
    }

    const row = token as TokenRow;

    if (row.user_id !== caller.userId) {
      throw new AuthzError("This token does not belong to you.", 403);
    }
    if (row.used_at) {
      throw new AuthzError("This token has already been used.", 400);
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      throw new AuthzError("This token has expired.", 400);
    }

    const { data: userData, error: userError } = await serviceClient.auth.admin.getUserById(row.user_id);
    if (userError || !userData?.user?.email) {
      throw new AuthzError("Recipient not found.", 404);
    }

    const { subject, html } = buildEmail(row, raw_secret);
    await sendViaResend(userData.user.email, subject, html);

    return new Response(JSON.stringify({ ok: true }), {
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
