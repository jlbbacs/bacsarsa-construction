import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import { ImageUploadField } from "./ImageUploadField";
import type { Project, ProjectCategory } from "../../types";

const inputClass =
  "rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500";

const CATEGORY_OPTIONS: ProjectCategory[] = ["Commercial", "Residential", "Industrial"];

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function ProjectEditor({
  project,
  onSaved,
  onCancel,
}: {
  project: Project | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [category, setCategory] = useState<ProjectCategory>(project?.category ?? "Commercial");
  const [location, setLocation] = useState(project?.location ?? "");
  const [completionDate, setCompletionDate] = useState(toDateInput(project?.completion_date ?? null));
  const [imageUrl, setImageUrl] = useState<string | null>(project?.image_url ?? null);
  const [clientName, setClientName] = useState(project?.client_name ?? "");
  const [isFeatured, setIsFeatured] = useState(project?.is_featured ?? false);
  const [displayOrder, setDisplayOrder] = useState(project?.display_order ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim() || null,
      completion_date: completionDate || null,
      image_url: imageUrl,
      client_name: clientName.trim() || null,
      is_featured: isFeatured,
      display_order: displayOrder,
    };

    const { error: saveError } = project
      ? await supabase.from("projects").update(payload).eq("id", project.id)
      : await supabase.from("projects").insert(payload);

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    onSaved();
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onCancel}
        className="flex w-fit items-center gap-2 text-sm font-semibold uppercase tracking-wide text-steel-600 hover:text-charcoal-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back To Projects
      </button>

      {error && <ErrorNotice message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Project title" />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`resize-none ${inputClass}`}
              placeholder="Short description shown on the Projects page"
            />
          </label>

          <div className="grid grid-cols-2 gap-5">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Location
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="City, ST" />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Client Name
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <ImageUploadField label="Image" bucket="project-images" value={imageUrl} onChange={setImageUrl} />

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)} className={inputClass}>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Completion Date
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Display Order
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className={inputClass}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-charcoal-900">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4" />
            Featured on Home page
          </label>

          <Button type="button" onClick={handleSave} disabled={saving} className="disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
