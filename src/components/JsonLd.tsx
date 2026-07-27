import { Helmet } from "react-helmet-async";

/** Renders one or more JSON-LD blocks inside Helmet, escaping `</script>` so embedded content (e.g. a title containing that literal string) can't break out of the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <Helmet>
      {items.map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify({ "@context": "https://schema.org", ...item }).replace(/<\/script/gi, "<\\/script")}
        </script>
      ))}
    </Helmet>
  );
}
