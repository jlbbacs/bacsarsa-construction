import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { getStoredConsent, updateConsent, type ConsentChoice } from "../lib/analytics";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);
  }, []);

  function choose(choice: ConsentChoice) {
    updateConsent(choice);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[150] border-t border-concrete-200 bg-white px-4 py-4 shadow-lg sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-steel-600">
              We use cookies to understand how visitors use this site. You can accept or decline non-essential analytics
              cookies.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => choose("denied")}
                className="rounded-md border border-concrete-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-charcoal-900 transition-colors hover:bg-concrete-50"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={() => choose("granted")}
                className="rounded-md bg-safety-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-safety-700"
              >
                Accept All
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
