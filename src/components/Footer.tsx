import { Link } from "react-router-dom";
import { HardHat, Mail, MapPin, Phone } from "lucide-react";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";
import { formatAddress } from "../lib/address";
import { trackEmailClick, trackPhoneClick } from "../lib/analytics";
import { Container } from "./Container";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "./icons/SocialIcons";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

export function Footer() {
  const { settings } = useSiteSettingsContext();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-900 text-steel-200">
      <Container className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 sm:py-16 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-heading text-lg font-semibold text-white">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.brand_name}
                className="h-9 w-9 rounded-md object-contain"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-safety-500 text-white">
                <HardHat className="h-5 w-5" />
              </span>
            )}
            {settings.brand_name}
          </Link>
          <p className="text-sm leading-relaxed text-steel-400">{settings.footer_text}</p>
          <div className="flex items-center gap-3 pt-1">
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="text-steel-400 hover:text-safety-400">
                <FacebookIcon className="h-5 w-5" />
              </a>
            )}
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="text-steel-400 hover:text-safety-400">
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
            {settings.linkedin_url && (
              <a href={settings.linkedin_url} target="_blank" rel="noreferrer" className="text-steel-400 hover:text-safety-400">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-charcoal-800 pt-8 sm:border-0 sm:pt-0">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1">
            {QUICK_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-steel-400 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-charcoal-800 pt-8 sm:border-0 sm:pt-0">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
          <a
            href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
            onClick={() => trackPhoneClick()}
            className="flex items-start gap-2 text-sm text-steel-400 hover:text-white"
          >
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-safety-400" />
            {settings.phone}
          </a>
          <a
            href={`mailto:${settings.email}`}
            onClick={() => trackEmailClick()}
            className="flex items-start gap-2 text-sm text-steel-400 hover:text-white"
          >
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-safety-400" />
            {settings.email}
          </a>
          <span className="flex items-start gap-2 text-sm text-steel-400">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-safety-400" />
            {formatAddress(settings)}
          </span>
        </div>
      </Container>

      <div className="border-t border-charcoal-800 bg-safety-500">
        <Container className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-lg font-semibold text-white">Ready To Build?</h3>
            <p className="text-sm text-white/90">
              Tell us about your project and we&apos;ll get back to you within one business day.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex w-fit shrink-0 items-center bg-charcoal-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-charcoal-800"
          >
            Get a Free Quote
          </Link>
        </Container>
      </div>

      <div className="border-t border-charcoal-800">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-steel-400 sm:flex-row sm:text-left">
          <span>
            &copy; {year} {settings.brand_name}. All rights reserved.
          </span>
          <span>Licensed &amp; Insured General Contractor</span>
        </Container>
      </div>
    </footer>
  );
}
