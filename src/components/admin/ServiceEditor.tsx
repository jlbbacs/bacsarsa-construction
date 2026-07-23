import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { SERVICE_ICON_NAMES, getServiceIcon } from "../../lib/serviceIcons";
import { useServiceCategories } from "../../hooks/useServiceCategories";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import { ImageUploadField } from "./ImageUploadField";
import type { Service } from "../../types";

const inputClass =
  "rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500";

export function ServiceEditor({
  service,
  onSaved,
  onCancel,
}: {
  service: Service | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { categories } = useServiceCategories();
  const [title, setTitle] = useState(service?.title ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [iconName, setIconName] = useState(service?.icon_name ?? SERVICE_ICON_NAMES[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(service?.image_url ?? null);
  const [categoryId, setCategoryId] = useState<string>(service?.category_id ?? "");
  const [displayOrder, setDisplayOrder] = useState(service?.display_order ?? 0);
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
      icon_name: iconName,
      image_url: imageUrl,
      category_id: categoryId || null,
      display_order: displayOrder,
    };

    const { error: saveError } = service
      ? await supabase.from("services").update(payload).eq("id", service.id)
      : await supabase.from("services").insert(payload);

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
        Back To Services
      </button>

      {error && <ErrorNotice message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Service title" />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`resize-none ${inputClass}`}
              placeholder="Short description shown on the Services page"
            />
          </label>
        </div>

        <div className="flex flex-col gap-5">
          <ImageUploadField label="Image" bucket="site-images" value={imageUrl} onChange={setImageUrl} />

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Category
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Icon
            <select value={iconName} onChange={(e) => setIconName(e.target.value)} className={inputClass}>
              {SERVICE_ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-safety-500 text-white">
              {(() => {
                const Icon = getServiceIcon(iconName);
                return <Icon className="h-5 w-5" />;
              })()}
            </span>
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

          <Button type="button" onClick={handleSave} disabled={saving} className="disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
