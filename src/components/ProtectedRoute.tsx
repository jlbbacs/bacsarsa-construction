import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCurrentProfile } from "../context/ProfileContext";

const BLOCKED_STATUSES = ["disabled", "suspended", "locked"];

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useCurrentProfile();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const isLoggingOut = sessionStorage.getItem("logging_out");
      if (isLoggingOut || window.location.pathname === "/login") return;

      const isTimingOut = window.location.search.includes("reason=expired");
      if (event === "SIGNED_OUT") {
        if (isTimingOut) return;
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [location.pathname]);

  // Defense in depth: a disabled/suspended/locked account is already banned
  // at the Supabase Auth level (via the admin-users Edge Function), but that
  // only blocks *future* token refreshes -- a still-valid access token in
  // the browser would otherwise keep working until it naturally expires.
  // Kick them out the moment we see a blocked status on their own profile.
  useEffect(() => {
    if (!profile || !BLOCKED_STATUSES.includes(profile.status)) return;

    (async () => {
      sessionStorage.setItem("logging_out", "true");
      await supabase.auth.signOut();
      sessionStorage.removeItem("logging_out");
      navigate(`/login?reason=${profile.status}`, { replace: true });
    })();
  }, [profile, navigate]);

  if (isAuthenticated === null || (isAuthenticated && profileLoading)) return null;

  if (!isAuthenticated) {
    if (location.pathname === "/login") return null;
    if (window.location.search.includes("reason=expired")) return null;
    return <Navigate to="/login" replace />;
  }

  // Authenticated but no profile row exists yet -- don't redirect to
  // /login (they ARE logged in, that would just bounce right back here).
  // Most likely cause: the Phase A migrations haven't been applied yet.
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-charcoal-900 px-4 text-center">
        <div className="max-w-sm text-sm text-steel-200">
          <p className="mb-2 font-semibold text-white">Account setup incomplete</p>
          <p>
            No profile record was found for your account. If this is unexpected, confirm the user-management database
            migrations have been applied, or contact your Super Admin.
          </p>
        </div>
      </div>
    );
  }

  if (BLOCKED_STATUSES.includes(profile.status)) {
    return null; // sign-out effect above is already in flight
  }

  return <>{children}</>;
}
