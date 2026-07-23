import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Mail } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";

const inputClass =
  "rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500";

export function AccountSettingsPanel() {
  const [currentEmail, setCurrentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload: { email?: string; password?: string } = {};

    if (email.trim() && email.trim() !== currentEmail) {
      payload.email = email.trim();
    }
    if (newPassword) {
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
      payload.password = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setError("Change the email or enter a new password before saving.");
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser(payload);
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setSuccess(
      payload.email
        ? "Saved. Check your new email inbox to confirm the change before it takes effect."
        : "Password updated."
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl font-semibold text-charcoal-900">Account Settings</h2>

      {error && <ErrorNotice message={error} />}
      {success && (
        <div className="flex items-center gap-3 rounded-md border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-charcoal-900">
          {success}
        </div>
      )}

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
          New Password
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className={`w-full pl-9 ${inputClass}`}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
          Confirm New Password
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={`w-full pl-9 ${inputClass}`}
            />
          </div>
        </label>

        <Button type="submit" disabled={saving} className="w-fit disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
