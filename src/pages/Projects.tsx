import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { buildCollectionPage, buildProjectCreativeWork } from "../lib/schema";

// Kept in sync with ProjectCard.tsx's CATEGORY_COLORS -- see that file's
// comment for why Residential uses charcoal-700 instead of amber-500.
const CATEGORY_COLORS: Record<string, string> = {
  Commercial: "bg-safety-600",
  Residential: "bg-charcoal-700",
  Industrial: "bg-steel-600",
};

export default function Projects() {
  const { projects, loading } = useProjects();
  const { settings } = useSiteSettingsContext();
  const [activeCategory, setActiveCategory] = useState("All");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionOverflows, setDescriptionOverflows] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [searchParams] = useSearchParams();
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const appliedLegacyRedirectRef = useRef(false);
  const categoryMountedRef = useRef(false);

  const filtered = useMemo(
    () => (activeCategory === "All" ? projects : projects.filter((p) => p.category === activeCategory)),
    [projects, activeCategory]
  );

  const selectedIndex = slug ? filtered.findIndex((p) => p.slug === slug) : -1;
  const selectedProject = selectedIndex !== -1 ? filtered[selectedIndex] : null;

  // Closes the modal (navigates back to the plain listing) when the user
  // changes filter tabs while a project detail is open -- but not on the
  // very first render, so landing directly on /projects/:slug works.
  useEffect(() => {
    if (!categoryMountedRef.current) {
      categoryMountedRef.current = true;
      return;
    }
    if (slug) navigate("/projects", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Redirects the legacy ?project=<id> deep link (from before per-item
  // routes existed) to the equivalent /projects/:slug URL.
  useEffect(() => {
    if (slug || appliedLegacyRedirectRef.current) return;
    const legacyId = searchParams.get("project");
    if (!legacyId) return;
    const project = projects.find((p) => p.id === legacyId);
    if (project) {
      appliedLegacyRedirectRef.current = true;
      navigate(`/projects/${project.slug}`, { replace: true });
    }
  }, [projects, searchParams, slug, navigate]);

  function showPrev() {
    if (selectedIndex === -1 || filtered.length === 0) return;
    const prevIdx = (selectedIndex - 1 + filtered.length) % filtered.length;
    navigate(`/projects/${filtered[prevIdx].slug}`, { replace: true });
  }

  function showNext() {
    if (selectedIndex === -1 || filtered.length === 0) return;
    const nextIdx = (selectedIndex + 1) % filtered.length;
    navigate(`/projects/${filtered[nextIdx].slug}`, { replace: true });
  }

  useEffect(() => {
    if (selectedIndex === -1) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, filtered.length]);

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [selectedProject?.id]);

  useLayoutEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;
    setDescriptionOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [selectedProject?.id]);

  return (
    <>
      <SEO
        title={selectedProject ? selectedProject.title : "Projects"}
        description={
          selectedProject
            ? selectedProject.description
            : `Browse ${settings.brand_name}'s portfolio of commercial, residential, and industrial construction projects.`
        }
        image={selectedProject?.image_url}
        path={selectedProject ? `/projects/${selectedProject.slug}` : "/projects"}
        jsonLd={
          selectedProject
            ? buildProjectCreativeWork(selectedProject, settings)
            : buildCollectionPage({
                name: `Projects | ${settings.brand_name}`,
                description: `Browse ${settings.brand_name}'s portfolio of commercial, residential, and industrial construction projects.`,
                path: "/projects",
              })
        }
      />

      <PageHeader
        eyebrow="Our Work"
        title="A Portfolio Built On Delivery"
        subtitle="A selection of the commercial, residential, and industrial projects our crews have completed."
        imageUrl={settings.projects_header_image_url}
        breadcrumbs={
          selectedProject
            ? [{ name: "Projects", path: "/projects" }, { name: selectedProject.title, path: `/projects/${selectedProject.slug}` }]
            : [{ name: "Projects", path: "/projects" }]
        }
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
                <ProjectCard key={project.id} project={project} index={i} to={`/projects/${project.slug}`} />
              ))}
            </div>
          )}
        </Container>
      </section>

      <Modal open={selectedProject !== null} onClose={() => navigate("/projects")} title={selectedProject?.title ?? ""}>
        {selectedProject && (
          <div className="flex flex-col gap-5">
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-charcoal-800 to-charcoal-900">
              {selectedProject.image_url ? (
                <img
                  src={selectedProject.image_url}
                  alt={selectedProject.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
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
                    {selectedIndex + 1} / {filtered.length}
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
