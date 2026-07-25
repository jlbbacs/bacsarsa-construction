import { useState } from "react";
import { Building2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { deleteImage } from "../../lib/storage";
import { useAdminProjects } from "../../hooks/useAdminProjects";
import { Button } from "../Button";
import { PageLoader } from "../PageLoader";
import { ProjectEditor } from "./ProjectEditor";
import type { Project } from "../../types";

type View = { mode: "list" } | { mode: "editor"; project: Project | null };

export function ProjectsPanel() {
  const { projects, loading, refresh } = useAdminProjects();
  const [view, setView] = useState<View>({ mode: "list" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(project: Project) {
    if (!window.confirm(`Delete "${project.title}"?`)) return;
    setDeletingId(project.id);
    await supabase.from("projects").delete().eq("id", project.id);
    if (project.image_url) await deleteImage(project.image_url, "project-images");
    setDeletingId(null);
    refresh();
  }

  if (view.mode === "editor") {
    return (
      <ProjectEditor
        project={view.project}
        onCancel={() => setView({ mode: "list" })}
        onSaved={() => {
          refresh();
          setView({ mode: "list" });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-charcoal-900">Projects</h2>
        <Button type="button" onClick={() => setView({ mode: "editor", project: null })}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-concrete-200 py-16 text-center">
          <Building2 className="h-8 w-8 text-steel-400" />
          <p className="text-sm text-steel-600">No projects yet -- add your first one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-concrete-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-concrete-200 bg-concrete-50 text-xs font-semibold uppercase tracking-wide text-steel-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-concrete-200 last:border-0">
                  <td className="max-w-xs truncate px-4 py-3 font-semibold text-charcoal-900">
                    <span className="flex items-center gap-2">
                      {project.is_featured && <Star className="h-3.5 w-3.5 shrink-0 fill-safety-500 text-safety-500" />}
                      {project.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-steel-600">{project.category}</td>
                  <td className="px-4 py-3 text-steel-600">{project.location ?? "—"}</td>
                  <td className="px-4 py-3 text-steel-600">{project.display_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setView({ mode: "editor", project })}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-concrete-50 hover:text-charcoal-900"
                        aria-label="Edit project"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project)}
                        disabled={deletingId === project.id}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        aria-label="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
