import { HardHat } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 py-24 text-charcoal-900">
      <HardHat className="h-8 w-8 animate-pulse text-safety-500" />
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-steel-600">Loading</span>
    </div>
  );
}
