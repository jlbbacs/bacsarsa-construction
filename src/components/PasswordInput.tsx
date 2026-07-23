import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const VARIANT_CLASSES = {
  light: "border-concrete-200 text-charcoal-900 focus:border-safety-500",
  dark: "border-charcoal-700 bg-charcoal-900 text-white focus:border-safety-500",
};

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "new-password",
  variant = "light",
  required,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  variant?: "light" | "dark";
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
      <input
        id={id}
        type={visible ? "text" : "password"}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`w-full rounded-md border py-2.5 pl-9 pr-10 text-sm font-normal outline-none ${VARIANT_CLASSES[variant]}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-safety-500"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
