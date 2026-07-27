import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getStoredConsent, pushToDataLayer, setConsentDefault, trackEvent, trackFileDownload, trackOutboundClick, updateConsent } from "../lib/analytics";

const GTM_ID = import.meta.env.VITE_GTM_ID;
const isGtmConfigured = Boolean(GTM_ID && GTM_ID !== "GTM-XXXXXXX");

const DOWNLOAD_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip"];

function injectGtmLoader() {
  if (document.getElementById("gtm-loader")) return;
  const script = document.createElement("script");
  script.id = "gtm-loader";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}

/**
 * Mounted once in AppShell. Sets Consent Mode defaults + restores any prior
 * consent choice, loads the GTM container (only if VITE_GTM_ID is set to a
 * real value), pushes a page_view on every SPA route change (GA4/GTM doesn't
 * see BrowserRouter navigations on its own), and delegates click tracking for
 * outbound links and file downloads so future links are covered automatically.
 */
export function Analytics() {
  const location = useLocation();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setConsentDefault();
    const stored = getStoredConsent();
    if (stored) updateConsent(stored);

    if (isGtmConfigured) {
      pushToDataLayer({ "gtm.start": Date.now(), event: "gtm.js" });
      injectGtmLoader();
    }

    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement)?.closest("a");
      const href = anchor?.getAttribute("href");
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.hostname !== window.location.hostname) {
        trackOutboundClick(url.href);
        return;
      }

      if (DOWNLOAD_EXTENSIONS.some((ext) => url.pathname.toLowerCase().endsWith(ext))) {
        trackFileDownload(url.href);
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    // Deliberately doesn't include page_title here: this page's <SEO>/Helmet
    // title often hasn't committed yet at route-change time (it depends on
    // that page's own async data fetch resolving first), so a hand-captured
    // document.title at this point is frequently empty or stale. GTM's
    // built-in {{Page Title}} variable reads document.title lazily when a
    // tag actually fires, which is the race-free way to get it -- configure
    // GA4 tags to use that variable instead of a param from this event.
    trackEvent("page_view", { page_path: location.pathname, page_location: window.location.href });
  }, [location.pathname]);

  return null;
}
