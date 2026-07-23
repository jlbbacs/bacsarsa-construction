import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { HardHat, Lock, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { ErrorNotice } from "../components/ErrorNotice";
import { Button } from "../components/Button";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";

export default function Login() {
  const { settings } = useSiteSettingsContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const expired = new URLSearchParams(location.search).get("reason") === "expired";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    navigate("/dashboard", { replace: true });
  }

  if (sessionStorage.getItem("logging_out")) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-900 px-4 py-16">
      <Helmet>
        <title>Admin Login | {settings.brand_name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-sm rounded-md border border-charcoal-700 bg-charcoal-800 p-8">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-safety-500 text-white">
            <HardHat className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-heading text-xl font-semibold text-white">{settings.brand_name}</h1>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-steel-400">Admin Login</p>
          </div>
        </div>

        {expired && !error && <ErrorNotice message="Your session expired. Please sign in again." />}
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
        </form>

        <Link to="/" className="mt-6 block text-center text-xs font-semibold uppercase tracking-wide text-steel-400 hover:text-white">
          Back To Site
        </Link>
      </div>
    </div>
  );
}
