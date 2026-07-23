import { useState, type FormEvent } from "react";
import { Plus, Tag, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { slugify } from "../../lib/slug";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import { PageLoader } from "../PageLoader";
import type { BlogCategory } from "../../types";

export function CategoriesPanel({
  categories,
  loading,
  onRefresh,
}: {
  categories: BlogCategory[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase
      .from("blog_categories")
      .insert({ name: name.trim(), slug: slugify(name) });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setName("");
    onRefresh();
  }

  async function handleDelete(category: BlogCategory) {
    if (!window.confirm(`Delete category "${category.name}"? Posts using it will become uncategorized.`)) return;
    setDeletingId(category.id);
    await supabase.from("blog_categories").delete().eq("id", category.id);
    setDeletingId(null);
    onRefresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl font-semibold text-charcoal-900">Blog Categories</h2>

      <form onSubmit={handleAdd} className="flex max-w-md items-end gap-3">
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
          New Category Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Client Stories"
            className="rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500"
          />
        </label>
        <Button type="submit" disabled={saving || !name.trim()} className="disabled:opacity-60">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>

      {error && <ErrorNotice message={error} />}

      {loading ? (
        <PageLoader />
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between rounded-md border border-concrete-200 bg-white px-4 py-3"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold text-charcoal-900">
                <Tag className="h-4 w-4 text-safety-500" />
                {cat.name}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(cat)}
                disabled={deletingId === cat.id}
                className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                aria-label={`Delete ${cat.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
