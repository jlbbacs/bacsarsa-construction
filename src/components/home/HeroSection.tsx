import { m } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ButtonLink } from "../Button";
import { Container } from "../Container";
import type { HomeConfig } from "../../types";

export function HeroSection({ config }: { config: HomeConfig }) {
  return (
    <section className="relative overflow-hidden bg-charcoal-900">
      {config.hero_video_url ? (
        <video
          key={config.hero_video_url}
          src={config.hero_video_url}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : config.hero_image_url ? (
        <img
          src={config.hero_image_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 1px, transparent 18px)",
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-safety-500/20 blur-3xl" />
        </>
      )}

      {(config.hero_video_url || config.hero_image_url) && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/85 to-charcoal-900/50" />
      )}

      <Container className="relative flex flex-col gap-8 py-20 sm:py-28 lg:py-36">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 self-start rounded-full border border-safety-500/40 bg-safety-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-safety-400"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Licensed &amp; Insured General Contractor
        </m.div>

        <m.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
        >
          {config.hero_heading}
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl text-base leading-relaxed text-steel-200 sm:text-lg"
        >
          {config.hero_subheading}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center gap-4 pt-2"
        >
          <ButtonLink to={config.hero_cta_link} size="lg">
            {config.hero_cta_text}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink to={config.secondary_cta_link} variant="secondary" size="lg" className="border-white text-white hover:bg-white hover:text-charcoal-900">
            {config.secondary_cta_text}
          </ButtonLink>
        </m.div>
      </Container>
    </section>
  );
}
