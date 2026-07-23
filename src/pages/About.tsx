import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { SEO } from "../components/SEO";
import { Container } from "../components/Container";
import { PageHeader } from "../components/PageHeader";
import { StatsStrip } from "../components/StatsStrip";
import { PageLoader } from "../components/PageLoader";
import { ButtonLink } from "../components/Button";
import { useAboutConfig } from "../hooks/useAboutConfig";

export default function About() {
  const { config, loading } = useAboutConfig();

  if (loading) return <PageLoader />;

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about Meridian Construction Group's history, mission, and the crews behind every build."
        path="/about"
      />

      <PageHeader eyebrow="About Us" title={config.heading} subtitle={config.subheading} imageUrl={config.image_url} />

      <section className="bg-white py-16 md:py-24">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="prose-post lg:col-span-2"
          >
            <ReactMarkdown>{config.body_markdown}</ReactMarkdown>
          </motion.div>

          <div className="flex flex-col gap-4 rounded-md border-l-4 border-safety-500 bg-concrete-50 p-6">
            <span className="text-xs font-bold uppercase tracking-wide text-safety-600">Our Mission</span>
            <p className="text-base leading-relaxed text-charcoal-800">{config.mission_statement}</p>
            <ButtonLink to="/contact" className="mt-2 w-fit">
              Work With Us
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="bg-concrete-50 py-16 md:py-20">
        <Container>
          <StatsStrip stats={config.stats} />
        </Container>
      </section>
    </>
  );
}
