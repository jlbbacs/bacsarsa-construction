interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionHeading({ eyebrow, title, subtitle, align = "left", light = false }: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center items-center mx-auto" : "text-left items-start";
  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignClass}`}>
      {eyebrow && (
        <span className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? "text-safety-400" : "text-safety-600"}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`text-3xl font-semibold sm:text-4xl ${light ? "text-white" : "text-charcoal-900"}`}>{title}</h2>
      {subtitle && (
        <p className={`text-base leading-relaxed ${light ? "text-steel-200" : "text-steel-600"}`}>{subtitle}</p>
      )}
    </div>
  );
}
