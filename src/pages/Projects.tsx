import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, User, CalendarDays } from "lucide-react";
import { SEO } from "../components/SEO";
import { Container } from "../components/Container";
import { PageHeader } from "../components/PageHeader";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectFilterBar } from "../components/ProjectFilterBar";
import { PageLoader } from "../components/PageLoader";
import { Modal } from "../components/Modal";
import { useProjects } from "../hooks/useProjects";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";

const CATEGORY_COLORS: Record<string, string> = {
  Commercial: "bg-safety-500",
  Residential: "bg-amber-500",
  Industrial: "bg-steel-600",
};

export default function Projects() {
  const { projects, loading } = useProjects();
  const { settings } = useSiteSettingsContext();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionOverflows, setDescriptionOverflows] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  const filtered = useMemo(
    () => (activeCategory === "All" ? projects : projects.filter((p) => p.category === activeCategory)),
    [projects, activeCategory]
  );

  useEffect(() => {
    setSelectedIndex(null);
  }, [activeCategory]);

  function showPrev() {
    setSelectedIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  }

  function showNext() {
    setSelectedIndex((i) => (i === null ? null : (i + 1) % filtered.length));
  }

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, filtered.length]);

  const selectedProject = selectedIndex !== null ? filtered[selectedIndex] : null;

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [selectedIndex]);

  useLayoutEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;
    setDescriptionOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [selectedProject?.id]);

  return (
    <>
      <SEO
        title="Projects"
        description="Browse Meridian Construction Group's portfolio of commercial, residential, and industrial construction projects."
        path="/projects"
      />

      <PageHeader
        eyebrow="Our Work"
        title="A Portfolio Built On Delivery"
        subtitle="A selection of the commercial, residential, and industrial projects our crews have completed."
        imageUrl={settings.projects_header_image_url}
      />

      <section className="bg-concrete-50 py-16 md:py-24">
        <Container className="flex flex-col gap-10">
          <ProjectFilterBar active={activeCategory} onChange={setActiveCategory} />

          {loading ? (
            <PageLoader />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-steel-600">No projects in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} onClick={() => setSelectedIndex(i)} />
              ))}
            </div>
          )}
        </Container>
      </section>

      <Modal open={selectedProject !== null} onClose={() => setSelectedIndex(null)} title={selectedProject?.title ?? ""}>
        {selectedProject && (
          <div className="flex flex-col gap-5">
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-charcoal-800 to-charcoal-900">
              {selectedProject.image_url ? (
                <img
                  src={selectedProject.image_url}
                  alt={selectedProject.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-heading text-4xl font-bold uppercase tracking-widest text-charcoal-700">
                  {selectedProject.category}
                </span>
              )}

              {filtered.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label="Previous project"
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-charcoal-900/60 text-white transition-colors hover:bg-charcoal-900/80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next project"
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-charcoal-900/60 text-white transition-colors hover:bg-charcoal-900/80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-sm bg-charcoal-900/60 px-2 py-1 text-[11px] font-semibold text-white">
                    {selectedIndex! + 1} / {filtered.length}
                  </span>
                </>
              )}

              <span
                className={`absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${
                  CATEGORY_COLORS[selectedProject.category] ?? "bg-safety-500"
                }`}
              >
                {selectedProject.category}
              </span>
            </div>

            <div className="flex min-h-[7rem] flex-col gap-2">
              <p
                ref={descriptionRef}
                className={`text-base leading-relaxed text-steel-600 ${descriptionExpanded ? "" : "line-clamp-4"}`}
              >
                {selectedProject.description}
              </p>
              {descriptionOverflows && (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded((v) => !v)}
                  className="w-fit text-xs font-semibold uppercase tracking-wide text-safety-600 hover:text-safety-700"
                >
                  {descriptionExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>

            <div className="flex min-h-[3.25rem] flex-wrap content-start gap-x-6 gap-y-2 border-t border-concrete-200 pt-4 text-xs font-semibold uppercase tracking-wide text-steel-600">
              {selectedProject.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-safety-500" />
                  {selectedProject.location}
                </span>
              )}
              {selectedProject.client_name && (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-safety-500" />
                  {selectedProject.client_name}
                </span>
              )}
              {selectedProject.completion_date && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-safety-500" />
                  {new Date(selectedProject.completion_date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
