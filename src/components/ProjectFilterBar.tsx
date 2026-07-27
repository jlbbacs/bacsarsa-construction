const CATEGORIES = ["All", "Commercial", "Residential", "Industrial"] as const;

export function ProjectFilterBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            active === category
              ? "bg-safety-600 text-white"
              : "bg-white text-charcoal-800 ring-1 ring-inset ring-concrete-200 hover:bg-concrete-50"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
