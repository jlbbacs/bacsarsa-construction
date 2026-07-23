import { useState, type KeyboardEvent } from "react";
import { Tag, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { slugify } from "../../lib/slug";
import type { BlogTag } from "../../types";

export function TagsField({
  allTags,
  selected,
  onChange,
  onTagCreated,
}: {
  allTags: BlogTag[];
  selected: BlogTag[];
  onChange: (tags: BlogTag[]) => void;
  onTagCreated: () => void;
}) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = new Set(selected.map((t) => t.id));
  const suggestions = query.trim()
    ? allTags.filter((t) => !selectedIds.has(t.id) && t.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : [];

  function addTag(tag: BlogTag) {
    onChange([...selected, tag]);
    setQuery("");
  }

  function removeTag(id: string) {
    onChange(selected.filter((t) => t.id !== id));
  }

  async function handleCreate(name: string) {
    setCreating(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("blog_tags")
      .insert({ name, slug: slugify(name) })
      .select()
      .single();
    setCreating(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    addTag(data as BlogTag);
    onTagCreated();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const exactMatch = allTags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (exactMatch) {
      if (!selectedIds.has(exactMatch.id)) addTag(exactMatch);
      else setQuery("");
      return;
    }
    void handleCreate(trimmed);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-charcoal-900">Tags</span>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1.5 rounded-sm bg-safety-500/10 px-2.5 py-1 text-xs font-semibold text-safety-700"
            >
              <Tag className="h-3 w-3" />
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                aria-label={`Remove ${tag.name}`}
                className="text-safety-600 hover:text-safety-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={creating}
          placeholder="Type a tag and press Enter (creates it if new)"
          className="w-full rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500 disabled:opacity-60"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-concrete-200 bg-white shadow-lg">
            {suggestions.map((tag) => (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => addTag(tag)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-charcoal-900 hover:bg-concrete-50"
                >
                  <Tag className="h-3.5 w-3.5 text-safety-500" />
                  {tag.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <span className="text-xs font-semibold text-red-700">{error}</span>}
    </div>
  );
}
