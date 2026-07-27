declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

const CONSENT_KEY = "cookie_consent";

export type ConsentChoice = "granted" | "denied";

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
}

export function pushToDataLayer(event: Record<string, unknown>) {
  ensureDataLayer();
  window.dataLayer.push(event);
}

// GTM's own gtag() shim: pushes the raw arguments object, same shape gtag.js
// itself would push. This is what lets Consent Mode commands reach GTM.
function gtag(...args: unknown[]) {
  ensureDataLayer();
  window.dataLayer.push(args);
}

/**
 * Google Consent Mode v2 defaults, pushed before the GTM loader script runs.
 * Ad signals are always denied -- this site runs no ads/remarketing product
 * (Meta Pixel and LinkedIn Insight Tag were explicitly dropped from scope) --
 * only analytics_storage reflects the visitor's cookie-banner choice.
 */
export function setConsentDefault() {
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
}

export function updateConsent(choice: ConsentChoice) {
  gtag("consent", "update", { analytics_storage: choice });
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Ignore storage failures (private browsing, quota) -- the in-memory consent update still applies for this session.
  }
}

export function getStoredConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  pushToDataLayer({ event: name, ...params });
}

export function trackFormSubmit(formName: string) {
  trackEvent("form_submit", { form_name: formName });
}

export function trackPhoneClick() {
  trackEvent("phone_click");
}

export function trackEmailClick() {
  trackEvent("email_click");
}

export function trackOutboundClick(url: string) {
  trackEvent("outbound_click", { outbound_url: url });
}

export function trackFileDownload(url: string) {
  trackEvent("file_download", { file_url: url });
}

export function trackScrollDepth(percent: number) {
  trackEvent("scroll_depth", { percent });
}
