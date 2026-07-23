import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

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

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    if (location.pathname === "/login") return null;
    if (window.location.search.includes("reason=expired")) return null;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
