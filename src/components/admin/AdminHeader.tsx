import { Link, useNavigate } from "react-router-dom";
import { HardHat, LogOut } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Container } from "../Container";
import { useSiteSettingsContext } from "../../context/SiteSettingsContext";

export type AdminTab = "posts" | "categories" | "services" | "projects" | "home" | "about" | "settings" | "account";

const TAB_LABELS: Record<AdminTab, string> = {
  posts: "Posts",
  categories: "Categories",
  services: "Services",
  projects: "Projects",
  home: "Home",
  about: "About",
  settings: "Settings",
  account: "Account",
};

export function AdminHeader({
  tab,
  onTabChange,
}: {
  tab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}) {
  const { settings } = useSiteSettingsContext();
  const navigate = useNavigate();

  async function handleLogout() {
    sessionStorage.setItem("logging_out", "true");
    await supabase.auth.signOut();
    sessionStorage.removeItem("logging_out");
    navigate("/login", { replace: true });
  }

  return (
    <header className="bg-charcoal-900">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2.5 font-heading text-lg font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-safety-500 text-white">
            <HardHat className="h-5 w-5" />
          </span>
          {settings.brand_name}
          <span className="ml-1 text-xs font-semibold uppercase tracking-wide text-steel-400">Admin</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold text-steel-200 hover:text-white">
            View Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-steel-200 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </Container>

      <Container className="flex flex-wrap gap-1 pb-0">
        {(["posts", "categories", "services", "projects", "home", "about", "settings", "account"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTabChange(t)}
            className={`rounded-t-md px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t ? "bg-concrete-50 text-charcoal-900" : "text-steel-400 hover:text-white"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </Container>
    </header>
  );
}
