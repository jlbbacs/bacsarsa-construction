import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { HardHat, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { ErrorNotice } from "../components/ErrorNotice";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";

export default function ConfirmChange() {
  const { settings } = useSiteSettingsContext();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"working" | "success" | "error">("working");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This link is missing a confirmation token.");
      return;
    }

    supabase.rpc("confirm_username_change", { p_token: token }).then(({ error: rpcError }) => {
      if (rpcError) {
        setStatus("error");
        setError(rpcError.message);
        return;
      }
      setStatus("success");
    });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-900 px-4 py-16">
      <Helmet>
        <title>Confirm Change | {settings.brand_name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-sm rounded-md border border-charcoal-700 bg-charcoal-800 p-8 text-center">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-safety-500 text-white">
            <HardHat className="h-6 w-6" />
          </span>
          <h1 className="font-heading text-xl font-semibold text-white">{settings.brand_name}</h1>
        </div>

        {status === "working" && <p className="text-sm text-steel-200">Confirming your change...</p>}

        {status === "success" && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-400" />
            <p className="text-sm text-steel-200">Your username has been updated.</p>
          </div>
        )}

        {status === "error" && error && <ErrorNotice message={error} />}

        <Link to="/dashboard" className="mt-6 block text-xs font-semibold uppercase tracking-wide text-steel-400 hover:text-white">
          Go To Dashboard
        </Link>
      </div>
    </div>
  );
}
