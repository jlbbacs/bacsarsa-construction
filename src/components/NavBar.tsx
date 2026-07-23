import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HardHat, Menu, Phone, X } from "lucide-react";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";
import { Container } from "./Container";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

export function NavBar() {
  const { settings } = useSiteSettingsContext();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all ${
        scrolled ? "border-concrete-200 bg-white/95 shadow-sm backdrop-blur" : "border-transparent bg-white"
      }`}
    >
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link to="/" className="flex items-center gap-2.5 font-heading text-lg font-semibold text-charcoal-900 sm:text-xl">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.brand_name} className="h-9 w-9 rounded-md object-contain" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-charcoal-900 text-safety-500">
              <HardHat className="h-5 w-5" />
            </span>
          )}
          {settings.brand_name}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-sm font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? "text-safety-600" : "text-charcoal-800 hover:text-safety-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 text-sm font-semibold text-charcoal-900">
            <Phone className="h-4 w-4 text-safety-500" />
            {settings.phone}
          </a>
          <Link
            to="/contact"
            className="inline-flex items-center bg-safety-500 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-safety-600"
          >
            Get a Quote
          </Link>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center text-charcoal-900 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-concrete-200 bg-white lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wide ${
                      isActive ? "bg-concrete-50 text-safety-600" : "text-charcoal-800"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center bg-safety-500 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white"
              >
                Get a Quote
              </Link>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
