import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { slugify } from "../../lib/slug";
import { SERVICE_ICON_NAMES, getServiceIcon } from "../../lib/serviceIcons";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import type { ServiceCategory } from "../../types";

const inputClass =
  "w-full rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500 focus-visible:ring-2 focus-visible:ring-safety-500 focus-visible:ring-offset-2";

export function ServiceCategoriesPanel({
  categories,
  loading,
  onRefresh,
}: {
  categories: ServiceCategory[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState(SERVICE_ICON_NAMES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from("service_categories").insert({
      name: name.trim(),
      slug: slugify(name),
      icon_name: iconName,
      display_order: categories.length,
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setName("");
    onRefresh();
  }

  async function handleDelete(category: ServiceCategory) {
    if (!window.confirm(`Delete category "${category.name}"? Services using it will become uncategorized.`)) return;
    setDeletingId(category.id);
    await supabase.from("service_categories").delete().eq("id", category.id);
    setDeletingId(null);
    onRefresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-concrete-200 p-4">
      <span className="text-sm font-bold uppercase tracking-wide text-charcoal-900">Service Categories</span>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[160px] flex-1 flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal-900">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Renovations"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal-900">
          Icon
          <select value={iconName} onChange={(e) => setIconName(e.target.value)} className={inputClass}>
            {SERVICE_ICON_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" disabled={saving || !name.trim()} className="disabled:opacity-60">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>

      {error && <ErrorNotice message={error} />}

      {!loading && categories.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = getServiceIcon(cat.icon_name);
            return (
              <li
                key={cat.id}
                className="flex items-center gap-2 rounded-full bg-concrete-50 py-1.5 pl-3 pr-1.5 text-xs font-semibold text-charcoal-900"
              >
                <Icon className="h-3.5 w-3.5 text-safety-500" />
                {cat.name}
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  disabled={deletingId === cat.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-steel-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
