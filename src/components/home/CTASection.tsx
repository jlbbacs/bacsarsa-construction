import { ArrowRight, Phone } from "lucide-react";
import { Container } from "../Container";
import { ButtonLink } from "../Button";
import type { SiteSettings } from "../../types";

export function CTASection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="bg-safety-500 py-16 md:py-20">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl font-heading text-3xl font-semibold text-white sm:text-4xl">
          Ready To Start Your Next Project?
        </h2>
        <p className="max-w-xl text-base text-white/90">
          Get a free, no-obligation estimate from our team. We typically respond within one business day.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <ButtonLink to="/contact" className="bg-charcoal-900 hover:bg-charcoal-800">
            Get a Free Quote
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <a
            href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-2 border-2 border-white px-7 py-3.5 text-base font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-safety-600"
          >
            <Phone className="h-4 w-4" />
            {settings.phone}
          </a>
        </div>
      </Container>
    </section>
  );
}
