import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { HardHat, Lock, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { ErrorNotice } from "../components/ErrorNotice";
import { Button } from "../components/Button";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";

const REASON_MESSAGES: Record<string, string> = {
  expired: "Your session expired. Please sign in again.",
  disabled: "Your account has been disabled. Contact your Super Admin.",
  suspended: "Your account is suspended pending Super Admin approval.",
  locked: "Your account was locked due to too many failed login attempts.",
};

interface LockCheckRow {
  locked: boolean;
  locked_until: string | null;
}

export default function Login() {
  const { settings } = useSiteSettingsContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const reason = new URLSearchParams(location.search).get("reason");
  const reasonMessage = reason ? REASON_MESSAGES[reason] : null;

  // An already-authenticated visitor shouldn't see the login form again --
  // send them straight to the dashboard instead.
  useEffect(() => {
    if (sessionStorage.getItem("logging_out")) {
      setCheckingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data: lockData } = await supabase.rpc("check_account_lock", { p_email: email });
    const lockRow = (Array.isArray(lockData) ? lockData[0] : lockData) as LockCheckRow | undefined;

    if (lockRow?.locked) {
      const until = lockRow.locked_until ? new Date(lockRow.locked_until).toLocaleTimeString() : "shortly";
      setError(`This account is locked due to too many failed attempts. Try again after ${until}.`);
      setSubmitting(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    await supabase.rpc("record_login_activity", { p_email: email, p_success: !signInError });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    navigate("/dashboard", { replace: true });
  }

  if (sessionStorage.getItem("logging_out")) return <Navigate to="/login" replace />;
  if (checkingSession) return null;
  if (hasSession) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-900 px-4 py-16">
      <Helmet>
        <title>Admin Login | {settings.brand_name}</title>
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-steel-400">Admin Login</p>
          </div>
        </div>

        {reasonMessage && !error && <ErrorNotice message={reasonMessage} />}
        {error && <ErrorNotice message={error} />}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-steel-200">
            Password
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-charcoal-700 bg-charcoal-900 py-2.5 pl-9 pr-4 text-sm font-normal text-white outline-none focus:border-safety-500"
                placeholder="••••••••"
              />
            </div>
          </label>

          <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full disabled:opacity-60">
            {submitting ? "Signing In..." : "Sign In"}
          </Button>

          <Link to="/forgot-password" className="text-center text-xs font-semibold uppercase tracking-wide text-steel-400 hover:text-white">
            Forgot Password?
          </Link>
        </form>

        <Link to="/" className="mt-6 block text-center text-xs font-semibold uppercase tracking-wide text-steel-400 hover:text-white">
          Back To Site
        </Link>
      </div>
    </div>
  );
}
