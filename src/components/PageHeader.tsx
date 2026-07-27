import { SectionHeading } from "./SectionHeading";
import { Container } from "./Container";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  imageUrl,
  breadcrumbs,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  breadcrumbs?: BreadcrumbItem[];
}) {
  return (
    <section className="relative overflow-hidden bg-charcoal-900 py-16 sm:py-20">
      {imageUrl && (
        <>
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/85 to-charcoal-900/50" />
        </>
      )}
      <Container className="relative flex flex-col gap-4">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} light as="h1" />
      </Container>
    </section>
  );
}
