import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click", "keydown"] as const;

/**
 * Logs the admin out after `minutes` of inactivity in the dashboard. Sets the
 * same sessionStorage flags ProtectedRoute checks so the auth-state-change
 * listener doesn't fight this intentional redirect.
 */
export function useIdleTimeout(minutes: number) {
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const logout = async () => {
      sessionStorage.setItem("logging_out", "true");
      sessionStorage.setItem("logout_reason", "expired");
      await supabase.auth.signOut();
      sessionStorage.removeItem("logging_out");
      navigate("/login?reason=expired");
    };

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(logout, minutes * 60 * 1000);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes]);
}
