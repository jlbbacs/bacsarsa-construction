import type { BlogCategory } from "../types";

export function BlogCategoryFilter({
  categories,
  activeId,
  onChange,
}: {
  categories: BlogCategory[];
  activeId: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
          activeId === null ? "bg-safety-500 text-white" : "bg-white text-charcoal-800 ring-1 ring-inset ring-concrete-200 hover:bg-concrete-50"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            activeId === cat.id ? "bg-safety-500 text-white" : "bg-white text-charcoal-800 ring-1 ring-inset ring-concrete-200 hover:bg-concrete-50"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
