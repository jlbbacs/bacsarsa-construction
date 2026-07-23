import { AlertTriangle } from "lucide-react";

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-charcoal-900">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
      <span>{message}</span>
    </div>
  );
}
