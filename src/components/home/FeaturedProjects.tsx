import { ArrowRight } from "lucide-react";
import { Container } from "../Container";
import { SectionHeading } from "../SectionHeading";
import { ProjectCard } from "../ProjectCard";
import { ButtonLink } from "../Button";
import type { Project } from "../../types";

export function FeaturedProjects({ projects, loading }: { projects: Project[]; loading: boolean }) {
  const featured = projects.filter((p) => p.is_featured).length > 0 ? projects.filter((p) => p.is_featured) : projects;

  return (
    <section className="bg-charcoal-900 py-16 md:py-24">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Our Work" title="Recent Project Highlights" light />
          <ButtonLink to="/projects" variant="ghost" className="text-white decoration-safety-500 hover:text-safety-400">
            View All Projects
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>

        {!loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
