import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { HardHat } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { ErrorNotice } from "../../components/ErrorNotice";
import { Button } from "../../components/Button";
import { PasswordInput } from "../../components/PasswordInput";
import { PasswordStrengthMeter } from "../../components/PasswordStrengthMeter";
import { passwordMeetsRequirements } from "../../lib/password";
import { useSiteSettingsContext } from "../../context/SiteSettingsContext";

export default function SetPassword() {
  const { settings } = useSiteSettingsContext();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!passwordMeetsRequirements(password)) {
      setError("Password doesn't meet the requirements below.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setSubmitting(false);
      setError(updateError.message);
      return;
    }

    // The database trigger on auth.users (024) already guarantees the
    // account flips to active the moment the password above is set, so
    // this call is only for the activity-log entry -- if it fails, that's
    // a minor logging gap, not a reason to block the user from continuing.
    const { error: clearError } = await supabase.rpc("clear_force_password_change");
    if (clearError) console.error("clear_force_password_change failed:", clearError.message);

    setSubmitting(false);
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-900 px-4 py-16">
      <Helmet>
        <title>Set Your Password | {settings.brand_name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-sm rounded-md border border-charcoal-700 bg-charcoal-800 p-8">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.brand_name} className="h-12 w-12 rounded-md object-contain" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-safety-500 text-white">
              <HardHat className="h-6 w-6" />
            </span>
          )}
          <div>
            <h1 className="font-heading text-xl font-semibold text-white">{settings.brand_name}</h1>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-steel-400">Welcome -- Set Your Password</p>
          </div>
        </div>

        {error && <ErrorNotice message={error} />}

        {!ready ? (
          <p className="text-center text-sm leading-relaxed text-steel-200">
            This invite link is invalid or has expired. Ask your Super Admin to resend your invite.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
            <p className="text-sm text-steel-400">Choose a password to finish setting up your account.</p>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-steel-200">
              Password
              <PasswordInput value={password} onChange={setPassword} variant="dark" required />
            </label>

            <PasswordStrengthMeter password={password} variant="dark" />

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-steel-200">
              Confirm Password
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} variant="dark" required />
            </label>

            <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full disabled:opacity-60">
              {submitting ? "Saving..." : "Set Password & Continue"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
