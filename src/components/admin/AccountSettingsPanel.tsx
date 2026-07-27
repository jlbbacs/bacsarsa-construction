import { useEffect, useState, type FormEvent } from "react";
import { Mail, User, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import { PasswordInput } from "../PasswordInput";
import { PasswordStrengthMeter } from "../PasswordStrengthMeter";
import { passwordMeetsRequirements } from "../../lib/password";
import { useCurrentProfile } from "../../context/ProfileContext";
import { useToast } from "../../context/ToastContext";

const inputClass =
  "w-full rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500 focus-visible:ring-2 focus-visible:ring-safety-500 focus-visible:ring-offset-2";

interface PendingChange {
  email?: string;
  password?: string;
  forceLogoutOthers: boolean;
}

async function sendVerificationEmail(tokenId: string, rawSecret?: string) {
  await supabase.functions.invoke("send-notification-email", { body: { token_id: tokenId, raw_secret: rawSecret } });
}

function UsernameCard() {
  const { profile } = useCurrentProfile();
  const toast = useToast();
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newUsername.trim() || newUsername.trim() === profile?.username) {
      setError("Enter a different username first.");
      return;
    }

    setSubmitting(true);
    const { data, error: rpcError } = await supabase.rpc("request_username_change", {
      p_new_username: newUsername.trim(),
    });
    if (rpcError) {
      setSubmitting(false);
      setError(rpcError.message);
      return;
    }

    const tokenId = Array.isArray(data) ? data[0]?.token_id : (data as { token_id?: string } | null)?.token_id;
    if (tokenId) await sendVerificationEmail(tokenId);
    setSubmitting(false);
    setRequested(true);
    toast.info("Check your email to confirm the username change.");
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-concrete-200 bg-white p-6">
      <h3 className="font-heading text-base font-semibold text-charcoal-900">Username</h3>
      <p className="text-sm text-steel-600">
        Current username: <span className="font-semibold text-charcoal-900">{profile?.username}</span>
      </p>

      {error && <ErrorNotice message={error} />}
      {requested ? (
        <p className="text-sm text-green-700">
          Confirmation link sent. Your username stays <span className="font-semibold">{profile?.username}</span> until
          you click it.
        </p>
      ) : (
        <form onSubmit={handleRequest} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            New Username
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.trim())}
                className={`w-56 pl-9 ${inputClass}`}
              />
            </div>
          </label>
          <Button type="submit" variant="secondary" disabled={submitting} className="disabled:opacity-60">
            {submitting ? "Sending..." : "Request Change"}
          </Button>
          <span className="basis-full text-xs text-steel-500">
            Sends a confirmation link to your email. The change only applies once you click it, and expires after 24
            hours.
          </span>
        </form>
      )}
    </div>
  );
}

export function AccountSettingsPanel() {
  const { profile } = useCurrentProfile();
  const toast = useToast();
  const isSuperAdmin = profile?.role === "super_admin";

  const [currentEmail, setCurrentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forceLogoutOthers, setForceLogoutOthers] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const current = user?.email ?? "";
      setCurrentEmail(current);
      setEmail(current);
    })();
  }, []);

  function resetSensitiveFields() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setForceLogoutOthers(false);
  }

  async function applyChange(change: PendingChange) {
    if (change.password) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPassword,
      });
      if (reauthError) {
        setError("Current password is incorrect.");
        return false;
      }
    }

    const payload: { email?: string; password?: string } = {};
    if (change.email) payload.email = change.email;
    if (change.password) payload.password = change.password;

    const { error: updateError } = await supabase.auth.updateUser(payload);
    if (updateError) {
      setError(updateError.message);
      return false;
    }

    if (change.password) {
      await supabase.rpc("log_activity", { p_action: "password_changed" });
      if (change.forceLogoutOthers) {
        await supabase.auth.signOut({ scope: "others" });
      }
    }
    if (change.email) {
      await supabase.rpc("log_activity", { p_action: "email_change_requested", p_metadata: { new_email: change.email } });
    }

    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const change: PendingChange = { forceLogoutOthers };
    if (email.trim() && email.trim() !== currentEmail) change.email = email.trim();

    if (newPassword) {
      if (!passwordMeetsRequirements(newPassword)) {
        setError("New password doesn't meet the requirements below.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
      if (!currentPassword) {
        setError("Enter your current password to set a new one.");
        return;
      }
      change.password = newPassword;
    }

    if (!change.email && !change.password) {
      setError("Change the email or enter a new password before saving.");
      return;
    }

    setSaving(true);

    if (isSuperAdmin) {
      const { data, error: otpRequestError } = await supabase.rpc("request_super_admin_otp");
      setSaving(false);
      if (otpRequestError) {
        setError(otpRequestError.message);
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.token_id) await sendVerificationEmail(row.token_id, row.raw_code);
      setPendingChange(change);
      setOtpStep(true);
      toast.info("Enter the verification code sent to your email to confirm this change.");
      return;
    }

    const ok = await applyChange(change);
    setSaving(false);
    if (ok) {
      resetSensitiveFields();
      setSuccess(change.email ? "Saved. Check your new email inbox to confirm the change." : "Password updated.");
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    if (!pendingChange) return;
    setError(null);
    setSaving(true);

    const { data: verified, error: verifyError } = await supabase.rpc("verify_super_admin_otp", { p_code: otpCode });
    if (verifyError || !verified) {
      setSaving(false);
      setError("Invalid or expired code.");
      return;
    }

    const ok = await applyChange(pendingChange);
    setSaving(false);
    if (ok) {
      setOtpStep(false);
      setOtpCode("");
      resetSensitiveFields();
      setSuccess(pendingChange.email ? "Saved. Check your new email inbox to confirm the change." : "Password updated.");
      setPendingChange(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl font-semibold text-charcoal-900">Account Settings</h2>

      <UsernameCard />

      {error && <ErrorNotice message={error} />}
      {success && (
        <div className="flex items-center gap-3 rounded-md border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-charcoal-900">
          {success}
        </div>
      )}

      {otpStep ? (
        <form onSubmit={handleVerifyOtp} className="flex max-w-md flex-col gap-4 rounded-md border border-concrete-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-900">
            <ShieldCheck className="h-4 w-4 text-safety-500" />
            Verify It's You
          </div>
          <p className="text-sm text-steel-600">
            As Super Admin, sensitive changes need a verification code. Check your email and enter the 6-digit code
            below -- it expires in 10 minutes.
          </p>
          <input
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className={`w-40 text-center text-lg tracking-[0.3em] ${inputClass}`}
            placeholder="000000"
            inputMode="numeric"
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOtpStep(false);
                setPendingChange(null);
                setOtpCode("");
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || otpCode.length !== 6} className="disabled:opacity-60">
              {saving ? "Verifying..." : "Verify & Save"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Login Email
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-9 ${inputClass}`}
              />
            </div>
          </label>

          <div className="flex flex-col gap-1.5 border-t border-concrete-200 pt-5">
            <span className="text-sm font-semibold text-charcoal-900">Change Password</span>
            <span className="text-xs text-steel-600">Leave blank to keep your current password.</span>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Current Password
            <PasswordInput value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            New Password
            <PasswordInput value={newPassword} onChange={setNewPassword} />
          </label>
          {newPassword && <PasswordStrengthMeter password={newPassword} />}

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Confirm New Password
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} />
          </label>

          {newPassword && (
            <label className="flex items-center gap-2 text-sm text-charcoal-900">
              <input
                type="checkbox"
                checked={forceLogoutOthers}
                onChange={(e) => setForceLogoutOthers(e.target.checked)}
              />
              Also sign out of all other devices
            </label>
          )}

          <Button type="submit" disabled={saving} className="w-fit disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      )}
    </div>
  );
}
