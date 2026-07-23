import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Project } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  Commercial: "bg-safety-500",
  Residential: "bg-amber-500",
  Industrial: "bg-steel-600",
};

export function ProjectCard({
  project,
  index = 0,
  onClick,
  to,
}: {
  project: Project;
  index?: number;
  onClick?: () => void;
  to?: string;
}) {
  const cardClassName =
    "group flex w-full flex-col overflow-hidden rounded-md border border-concrete-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md";

  const content = (
    <>
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-charcoal-800 to-charcoal-900">
        {project.image_url ? (
          <img src={project.image_url} alt={project.title} className="h-full w-full object-cover" />
        ) : (
          <span className="font-heading text-4xl font-bold uppercase tracking-widest text-charcoal-700">
            {project.category}
          </span>
        )}
        <span
          className={`absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${
            CATEGORY_COLORS[project.category] ?? "bg-safety-500"
          }`}
        >
          {project.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-heading text-lg font-semibold text-charcoal-900">{project.title}</h3>
        <p className="text-sm leading-relaxed text-steel-600">{project.description}</p>
        {project.location && (
          <span className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-semibold uppercase tracking-wide text-steel-600">
            <MapPin className="h-3.5 w-3.5 text-safety-500" />
            {project.location}
          </span>
        )}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
    >
      {to ? (
        <Link to={to} className={cardClassName}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={cardClassName}>
          {content}
        </button>
      )}
    </motion.div>
  );
}
