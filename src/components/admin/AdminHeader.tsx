import { Link, useNavigate } from "react-router-dom";
import { HardHat, LogOut } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Container } from "../Container";
import { useSiteSettingsContext } from "../../context/SiteSettingsContext";
import { useCurrentProfile } from "../../context/ProfileContext";

export type AdminTab =
  | "posts"
  | "categories"
  | "services"
  | "projects"
  | "home"
  | "about"
  | "settings"
  | "users"
  | "security"
  | "account";

const TAB_LABELS: Record<AdminTab, string> = {
  posts: "Posts",
  categories: "Categories",
  services: "Services",
  projects: "Projects",
  home: "Home",
  about: "About",
  settings: "Settings",
  users: "Users",
  security: "Security",
  account: "Account",
};

// Tabs every role can see, in display order. Super-Admin-only tabs
// (settings, users, security) are appended separately below -- per spec,
// Administrators can manage content (posts/categories/services/projects/
// home/about) and their own account, but cannot touch system settings,
// user management, or security/activity logs.
const SHARED_TABS: AdminTab[] = ["posts", "categories", "services", "projects", "home", "about", "account"];
const SUPER_ADMIN_ONLY_TABS: AdminTab[] = ["users", "security", "settings"];

export function AdminHeader({
  tab,
  onTabChange,
}: {
  tab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}) {
  const { settings } = useSiteSettingsContext();
  const { profile } = useCurrentProfile();
  const navigate = useNavigate();

  const visibleTabs = profile?.role === "super_admin" ? [...SHARED_TABS, ...SUPER_ADMIN_ONLY_TABS] : SHARED_TABS;

  async function handleLogout() {
    sessionStorage.setItem("logging_out", "true");
    await supabase.auth.signOut();
    sessionStorage.removeItem("logging_out");
    navigate("/login", { replace: true });
  }

  return (
    <header className="bg-charcoal-900">
      <Container className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <div className="flex min-w-0 items-center gap-2.5 font-heading text-base font-semibold text-white sm:text-lg">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.brand_name}
              className="h-8 w-8 shrink-0 rounded-md object-contain sm:h-9 sm:w-9"
            />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-safety-500 text-white sm:h-9 sm:w-9">
              <HardHat className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
          )}
          <span className="truncate">{settings.brand_name}</span>
          <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-wide text-steel-400 sm:ml-1 sm:inline">
            Admin
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <Link to="/" className="text-xs font-semibold text-steel-200 hover:text-white sm:text-sm">
            View Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-steel-200 hover:text-white sm:gap-2 sm:text-sm"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </Container>

      {/* Desktop/tablet: horizontal tab row (fits without scrolling at sm+). */}
      <Container className="hidden overflow-x-auto sm:block">
        <div className="flex w-max min-w-full gap-1">
          {visibleTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTabChange(t)}
              className={`shrink-0 whitespace-nowrap rounded-t-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t ? "bg-concrete-50 text-charcoal-900" : "text-steel-400 hover:text-white"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </Container>

      {/* Mobile: a native select instead of a swipe-to-scroll tab row, so every
          tab (including Settings/Users/Security/About/Account) is reachable
          without a sideways gesture that's easy to mistake for page scroll. */}
      <Container className="pb-3 sm:hidden">
        <label className="sr-only" htmlFor="admin-tab-select">
          Dashboard section
        </label>
        <select
          id="admin-tab-select"
          value={tab}
          onChange={(e) => onTabChange(e.target.value as AdminTab)}
          className="w-full rounded-md border border-charcoal-700 bg-charcoal-800 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-safety-500 focus-visible:ring-2 focus-visible:ring-safety-500 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-900"
        >
          {visibleTabs.map((t) => (
            <option key={t} value={t}>
              {TAB_LABELS[t]}
            </option>
          ))}
        </select>
      </Container>
    </header>
  );
}
