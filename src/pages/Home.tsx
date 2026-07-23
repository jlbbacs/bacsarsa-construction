import { motion } from "framer-motion";
import { SEO } from "../components/SEO";
import { Container } from "../components/Container";
import { HeroSection } from "../components/home/HeroSection";
import { ServicesTeaser } from "../components/home/ServicesTeaser";
import { FeaturedProjects } from "../components/home/FeaturedProjects";
import { BlogTeaser } from "../components/home/BlogTeaser";
import { CTASection } from "../components/home/CTASection";
import { useHomeConfig } from "../hooks/useHomeConfig";
import { useServices } from "../hooks/useServices";
import { useProjects } from "../hooks/useProjects";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";

export default function Home() {
  const { config, loading: configLoading } = useHomeConfig();
  const { services, loading: servicesLoading } = useServices();
  const { projects, loading: projectsLoading } = useProjects();
  const { posts, loading: postsLoading } = useBlogPosts({ page: 0 });
  const { settings } = useSiteSettingsContext();

  return (
    <>
      <SEO
        title="Home"
        description={`${settings.brand_name} delivers commercial, residential, and industrial construction projects on time and on budget.`}
        path="/"
      />

      {!configLoading && <HeroSection config={config} />}

      <section className="bg-white py-16 md:py-24">
        <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-safety-600">{config.intro_eyebrow}</span>
            <h2 className="font-heading text-3xl font-semibold text-charcoal-900 sm:text-4xl">{config.intro_heading}</h2>
            <p className="text-base leading-relaxed text-steel-600">{config.intro_text}</p>
          </motion.div>
          <div className="flex flex-col gap-4 rounded-md border border-concrete-200 bg-concrete-50 p-8">
            <ul className="flex flex-col gap-4 text-sm text-charcoal-800">
              {config.intro_bullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-safety-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <ServicesTeaser services={services} loading={servicesLoading} />
      <FeaturedProjects projects={projects} loading={projectsLoading} />
      <BlogTeaser posts={posts} loading={postsLoading} />
      <CTASection settings={settings} />
    </>
  );
}
