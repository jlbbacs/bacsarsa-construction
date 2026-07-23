import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "../lib/password";

const VARIANT_CLASSES = {
  light: { track: "bg-concrete-200", met: "text-green-700", unmet: "text-steel-600" },
  dark: { track: "bg-charcoal-700", met: "text-green-400", unmet: "text-steel-200" },
};

export function PasswordStrengthMeter({
  password,
  variant = "light",
}: {
  password: string;
  variant?: "light" | "dark";
}) {
  const metCount = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  const strengthColor = metCount <= 2 ? "bg-red-600" : metCount <= 4 ? "bg-amber-500" : "bg-green-600";
  const colors = VARIANT_CLASSES[variant];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {PASSWORD_RULES.map((rule, i) => (
          <span
            key={rule.label}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i < metCount ? strengthColor : colors.track}`}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-1">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${met ? colors.met : colors.unmet}`}>
              {met ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0 text-steel-400" />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
