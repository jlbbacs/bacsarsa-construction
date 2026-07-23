import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { HardHat, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { ErrorNotice } from "../components/ErrorNotice";
import { Button } from "../components/Button";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";

export default function ForgotPassword() {
  const { settings } = useSiteSettingsContext();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSubmitting(false);

    // Always show the same success state regardless of whether the email
    // matches an account -- avoids leaking which addresses are registered.
    if (resetError && resetError.message.includes("not configured")) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-900 px-4 py-16">
      <Helmet>
        <title>Forgot Password | {settings.brand_name}</title>
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-steel-400">Forgot Password</p>
          </div>
        </div>

        {error && <ErrorNotice message={error} />}

        {sent ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm leading-relaxed text-steel-200">
              If an account exists for <span className="text-white">{email}</span>, a password reset link has been
              sent. The link expires in 30 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <p className="text-sm text-steel-400">Enter your account email and we'll send you a reset link.</p>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-steel-200">
              Email
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-charcoal-700 bg-charcoal-900 py-2.5 pl-9 pr-4 text-sm font-normal text-white outline-none focus:border-safety-500"
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full disabled:opacity-60">
              {submitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <Link to="/login" className="mt-6 block text-center text-xs font-semibold uppercase tracking-wide text-steel-400 hover:text-white">
          Back To Login
        </Link>
      </div>
    </div>
  );
}
